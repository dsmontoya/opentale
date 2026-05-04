SPEC_KIT_VERSION := 0.8.4

.PHONY: setup-mac

setup-mac:
	brew install asdf
	asdf plugin add python || true
	asdf plugin add uv || true
	asdf install

	brew install Kilo-Org/tap/kilo

	uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v$(SPEC_KIT_VERSION)
