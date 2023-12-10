import { Command } from "commander";

const program = new Command()

program
  .name('ffmpeg cluster master')
  .description('The master node for the ffmpeg cluster')
  .version('0.2.0')

await program.parseAsync()