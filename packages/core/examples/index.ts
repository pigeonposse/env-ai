import { run } from "../src";

run({
  input: ['./src/**', './package.json'],
  theme: 'docs',
  debug: true,
  output: 'build/output.md',
})