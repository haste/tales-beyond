#!/usr/bin/env bun

import { $ } from "bun";

await $`bun web-ext build -o -s build/chrome`;
