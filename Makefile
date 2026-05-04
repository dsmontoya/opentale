.PHONY: setup-mac

setup-mac:
	brew install asdf
	asdf plugin add python || true
	asdf plugin add uv || true
	asdf install
