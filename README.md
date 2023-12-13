# aws-jq-reports

This repo shows how to create reports on data from AWS DynamoDB, which is further processed with jq.

The process is not automated, but it consists of some building-blocks to get your manual process to the finish line a bit quicker.

## Useful links

- [AWS DynamoDB Scan](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html)

- [JQ Homepage](https://jqlang.github.io/jq/)
- [An Introduction to JQ](https://earthly.dev/blog/jq-select)
- [JQ Tutorial](https://github.com/rjz/jq-tutorial)
- [Exercism - JQ](https://exercism.org/tracks/jq/concepts)

## Problem

I want to create a simple report showing which vehicles have multiple owners active at the same time...

### Reporting on Vehicles with specific ownerships

Filtering directly on the owners collection (map size) in AWS DynamoDB doesn't seem to work, so I will instead do a raw projection of the data needed without any filters applied. This data can then be processed further with jq.

---

## Get raw data

You need to have your credentials set up in order to have access to the correct account when performing this step.

As we are storing the output in a local file (called `dynamo.json`), we will not need any online connectivity for the rest of the steps.


### Export AWS DynamoDB JSON

```shell
aws dynamodb scan \
     --table-name 'polestar360-prod-vehicle-api-back' \
     --projection-expression 'vin, pno34, owners, primaryDriver' \
     > ./input/dynamo.json
```

[_Example Data - dynamo.json_](reports/example/input/dynamo.json)

### Unmarshalling

The transformation from AWS DynamoDB JSON to "normal" unmarshalled JSON notation is expensive for larger files, so do this once as a prerequisite for quicker processing of the reports. 👍

```shell
jq '
  import "scripts/funcs" as f;
  f::init
' ./input/dynamo.json > ./input/data.json
```

[_Example Data - data.json_](reports/example/input/data.json)

Also, this could be combined with broad filtering, to get a smaller subset of data to work with in the reporting steps.

```shell
jq --slurpfile vins ./vins.json '
  import "scripts/funcs" as f;
  f::init | f::keep($vins | .[])
' ./input/dynamo.json > ./input/filtered.json
```
> Example of unmarshalling & filtering the dataset by a list of VINS.

[_Example Data - filtered.json_](reports/example/input/filtered.json)

```shell
jq '
  import "scripts/funcs" as f;
  f::init | f::model_ps1
' ./input/dynamo.json > ./input/filtered.json
```
> Example of unmarshalling & filtering the dataset on a specific model(PS1).

---

## Reporting

Now when we have done the initial pre-processing of the data, it's both easier to look at and work with. So now we are ready to start creating some reports from the data, let's go! :)

### Report - Grouped count

This produces a small overview report, grouped on the number of active owners a car has.

```shell
jq '
  import "scripts/funcs" as f;
  f::active | f::grouped_owners
' ./input/data.json > ./output/cars-grouped-owners-count.json
```

[_Example Report_](reports/example/output/cars-grouped-owners-count.json)

### Report - All VINS

This is just a simple sorted list of all the vins extracted from the input data.

```shell
jq '
  import "scripts/funcs" as f;
  f::proj_vin_array
' ./input/data.json > ./output/all-vins.json
```

### Cars with 0 owners

As this doesn't need any owner details (it should be empty), we simplify this report to only be an array of sorted VINs.

```shell
jq '
  import "scripts/funcs" as f;
  f::active | f::owners_eq(0) | f::proj_vin_array
' ./input/data.json > ./output/cars-with-0-owners.json
```

[_Example Report_](reports/example/output/cars-with-0-owners.json)


If you instead of a JSON array with quoted values - only need a simple text file with each value in a raw format, you could do an extra processing step to get it in that format.

```shell
jq -r '
  .[]
' ./output/cars-with-0-owners.json > ./output/cars-with-0-owners.txt
```

[_Example Report_](reports/example/output/cars-with-0-owners.txt)

---

### Report - Vehicle details for cars with 1 owner

This produces a list of vins, with the additional details of the owners.

```shell
jq '
  import "scripts/funcs" as f;
  f::init | f::active | f::owners_eq(1) | f::proj_details
'./input/data.json > ./output/cars-with-1-owners.json
```

[_Example Report_](reports/example/output/cars-with-1-owners.json)
