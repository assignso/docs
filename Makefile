.PHONY: check install lint build dev generate

install:
	npm ci

lint:
	npm run lint

build:
	npm run build

dev:
	npm run dev

generate:
	npm run generate:api

check: lint build
