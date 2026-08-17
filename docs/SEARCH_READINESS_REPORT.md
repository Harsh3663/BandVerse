# Search Readiness Report

## API

`GET /api/v1/search?type=performers|bands|venues|events`

## Features

- Pagination, city/category/keyword filters, sort (`relevance|rating|name|date`)
- Band search = performers with `kind=band`
- Relevance ranking for keyword matches
- SWR cache via existing search service

Maintains prior API contract; adds `bands` type.
