# Makefile for Universal AI-Native Template

.PHONY: setup setup-ai help

help:
	@echo "Usage: make [target]"
	@echo "targets:"
	@echo "  setup     - Install dependencies and setup project"
	@echo "  setup-ai  - Initialize AI log files from examples"

setup: setup-ai
	pnpm install

setup-ai:
	@echo "🚀 Initializing AI log files..."
	@[ -f DEV_LOG.md ] || cp DEV_LOG.example.md DEV_LOG.md
	@[ -f TECH_NOTES.md ] || cp TECH_NOTES.example.md TECH_NOTES.md
	@[ -f GEMINI.md ] || cp GEMINI.example.md GEMINI.md
	@echo "✅ AI log files initialized (Local only, Git ignored)"
