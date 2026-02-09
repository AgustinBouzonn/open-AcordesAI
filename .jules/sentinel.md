# Sentinel's Journal

This file documents critical security learnings, vulnerability patterns, and architectural security decisions.

## 2025-02-17 - Prompt Injection in LLM Integration
**Vulnerability:** User input was directly interpolated into LLM prompts without sanitization.
**Learning:** LLMs are susceptible to "prompt injection" where user input can override system instructions.
**Prevention:** Always sanitize input intended for LLM prompts. Remove control characters and quotes that might break the prompt structure. Limit input length.
