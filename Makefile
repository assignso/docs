.PHONY: check install lint

install:
	npm ci

lint:
	npm run lint

check: lint
