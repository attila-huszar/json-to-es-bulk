# `json-to-es-bulk`

Simple utility that reads in a file (specified on the command line with `-f`) that
contains an array of JSON data and outputs a new file with contents suitable
as the request body for an Elasticsearch bulk request.

The utility will create a file named `data.txt` in the current directory or output
path (specified with `-o`).

## Limitations

- Currently is required that there is a property named `id` in each object
of the array in order to properly create the bulk request.
- Only `index` operations are supported

> The easy use-case for this tool is to use something like [JSON-Generator](http://www.json-generator.com/)
to generate test data that can easily be converted to a bulk request.

## Usage

### Creating request data for an input file

Start with **npm start** and specify in prompts or

```bash
node index.js -f input.json -i test
```

This will read `input.json` from the current directory, and create a bulk request to the `test` index.
