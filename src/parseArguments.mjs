/**
 * Splits command-line arguments into a command and options. `--name value` and
 * `--name=value` give an option; a bare `--name` gives a flag set to true.
 *
 * @param argv - The arguments after the script name.
 * @param valueOptions - Names of the options that take a value.
 * @returns The first argument as `command`, any bare arguments after it as `positionals`, and the options as a record.
 * @throws When an option that needs a value has none.
 */
export const parseArguments = (argv, valueOptions) => {
  const [command, ...rest] = argv;
  const options = {};
  const positionals = [];
  for (let index = 0; index < rest.length; index += 1) {
    const argument = rest[index];
    if (!argument.startsWith('--')) {
      positionals.push(argument);
      continue;
    }
    const [name, inline] = argument.slice(2).split(/=(.*)/s);
    if (valueOptions.includes(name)) {
      const value = inline ?? rest[++index];
      if (value === undefined || value.startsWith('--')) throw new Error(`--${name} needs a value`);
      options[name] = value;
    } else {
      options[name] = true;
    }
  }
  return { command, positionals, options };
};
