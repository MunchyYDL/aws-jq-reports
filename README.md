# aws-jq-reports

This repo shows how to create reports on data from AWS DynamoDB, which is further processed with jq.

The process is not automated, but it consists of some building-blocks to get your manual process to the finish line a bit quicker.

## Useful links

- [AWS DynamoDB Scan](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html)

- [JQ Homepage](https://jqlang.github.io/jq/)
- [An Introduction to JQ](https://earthly.dev/blog/jq-select)
- [JQ Tutorial](https://github.com/rjz/jq-tutorial)

## Problem

I want to create a simple report showing which vehicles have multiple owners active at the same time...

### Reporting on Vehicles with specific ownerships

Filtering directly on the owners collection (map size) in AWS DynamoDB doesn't seem to work, so I will instead do a raw projection of the data needed without any filters applied. This data can then be processed further with jq.

### Get raw data

You need to have your credentials set up in order to have access to the correct account when performing this step.

As we are storing the output in a file called `data.json`, we will not need any online connectivity for the rest of the steps.

```shell
aws dynamodb scan \
     --table-name 'polestar360-prod-vehicle-api-back' \
     --projection-expression 'vin, owners' \
     > data.json
```

[_Example Data_](example-reports/data.json)

### Report - Grouped count

This produces a small overview report, grouped on the number of active owners a car has.

```shell
cat data.json | jq '
  import "scripts/funcs" as f;
  f::init | f::active | f::grouped
' > reports/cars-grouped-count.json
```

[_Example Report_](example-reports/cars-grouped-count.json)

### Report - All VINS

This is just a simple sorted list of all the vins extracted from the input data.

```shell
cat data.json | jq '
  import "scripts/funcs" as f;
  f::init | f::proj_vin_array
' > reports/all-vins.json

```

### Cars with 0 owners

As this doesn't need any owner details (it should be empty), we simplify this report to only be an array of sorted VINs.

```shell
cat data.json | jq '
  import "scripts/funcs" as f;
  f::init | f::active | f::owners_eq(0) | f::proj_vin_array
' > reports/cars-with-0-owners.json
```

[_Example Report_](example-reports/cars-with-0-owners.json)

```shell
cat reports/cars-with-0-owners.json | jq -r '.[]
' > reports/cars-with-0-owners.txt
```

[_Example Report_](example-reports/cars-with-0-owners.txt)


### Cars with X owners

This produces a list of vins, with the additional details of the owners.

```shell
cat data.json | jq '
  import "scripts/funcs" as f;
  f::init | f::active | f::owners_eq(1) | f::proj_details
' > reports/cars-with-1-owners.json
```

[_Example Report_](example-reports/cars-with-1-owners.json)
