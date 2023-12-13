# aws-jq-reports

This repo shows how to create reports on data from AWS DynamoDB, which is further processed with jq.

The process is not automated, but it consists of some building-blocks to get your manual process to the finish line a bit quicker.

## Useful links

- [AWS DynamoDB Scan](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html)

- [JQ Homepage](https://jqlang.github.io/jq/)
- [An Introduction to JQ](https://earthly.dev/blog/jq-select)
- [JQ Tutorial](https://github.com/rjz/jq-tutorial)
- [JQ ](https://exercism.org/tracks/jq/concepts)

## Problem

I want to create a simple report showing which vehicles have multiple owners active at the same time...

### Reporting on Vehicles with specific ownerships

Filtering directly on the owners collection (map size) in AWS DynamoDB doesn't seem to work, so I will instead do a raw projection of the data needed without any filters applied. This data can then be processed further with jq.

### Get raw data

You need to have your credentials set up in order to have access to the correct account when performing this step.

As we are storing the output in a file called `data.json`, we will not need any online connectivity for the rest of the steps.


#### Export AWS DynamoDB JSON

```shell
aws dynamodb scan \
     --table-name 'polestar360-prod-vehicle-api-back' \
     --projection-expression 'vin, pno34, owners, primaryDriver' \
     > dynamo.json
```

[_Example Data - dynamo.json_](example-reports/dynamo.json)

#### Unmarshalling
The transformation from AWS DynamoDB JSON to "normal" unmarshalled JSON notation is expensive for larger files, so do this once as a prerequisite for quicker processing of the reports. 👍

```shell
jq \
'
  import "scripts/funcs" as f;
  f::init
' \
./dynamo.json \
> data.json
```

[_Example Data - data.json_](example-reports/data.json)

Please, take a second to compare the dynamo.json with the unmarshalled `data.json` in the examples to see the difference, both in size and readability.

---

Also, this should be combined with broad filtering as early as possible, to get a smaller subset of data to work with in the reporting steps.

> Example of unmarshalling & filtering the dataset by a list of VINS.

```shell
jq --slurpfile vins ./vins.json \
'
  import "scripts/funcs" as f;
  f::init | f::keep($vins | .[])
' \
./dynamo.json \
> filtered.json
```

[_Example Data - filtered.json_](example-reports/filtered.json)



### Reports

Now we have done the initial processing of the data, to make it easier to look at, and create som reports from it ready to start creating some reports from the data, let's go! :)

[_Example Data_](example-reports/data.json)

#### Report - Grouped count

This produces a small overview report, grouped on the number of active owners a car has.

```shell
jq '
  import "scripts/funcs" as f;
  f::active | f::grouped
' \
./data.json \
> reports/cars-grouped-count.json
```

[_Example Report_](example-reports/cars-grouped-count.json)

### Report - All VINS

This is just a simple sorted list of all the vins extracted from the input data.

```shell
jq '
  import "scripts/funcs" as f;
  f::proj_vin_array
' > reports/all-vins.json

```

### Cars with 0 owners

As this doesn't need any owner details (it should be empty), we simplify this report to only be an array of sorted VINs.

```shell
jq '
  import "scripts/funcs" as f;
  f::init | f::active | f::owners_eq(0) | f::proj_vin_array
' \
./dynamo.json \
> reports/cars-with-0-owners.json
```


```shell
jq --slurpfile vins ./vins.json \
'
  import "scripts/funcs" as f;
  f::init | f::keep($vins | .[]) | f::active | f::owners_eq(0) | f::proj_vin_array
' \
./dynamo.json \
> reports/cars-with-0-owners.json
```


[_Example Report_](example-reports/cars-with-0-owners.json)

```shell
cat reports/cars-with-0-owners.json | jq -r '.[]
' > reports/cars-with-0-owners.txt
```

[_Example Report_](example-reports/cars-with-0-owners.txt)


### Report - Vehicle details for cars with 1 owner

This produces a list of vins, with the additional details of the owners.

```shell
cat data.json | jq '
  import "scripts/funcs" as f;
  f::init | f::active | f::owners_eq(1) | f::proj_details
' > reports/cars-with-1-owners.json
```

[_Example Report_](example-reports/cars-with-1-owners.json)

### Report - Vehicle details for cars with X or more owners (filtered)

This produces a list of vins, with the additional details of the owners, but it's
also filtered on the vins from another file.

```shell
jq --slurpfile vins ./vins.json '
  import "scripts/funcs" as f;
  f::init | f::keep($vins | .[]) | f::active | f::owners_gte(1) | f::proj_details
' ./data.json > reports/cars-with-gte-1-owners-filtered.json
```

[_Example Report_](example-reports/cars-with-gte-1-owners-filtered.json)
