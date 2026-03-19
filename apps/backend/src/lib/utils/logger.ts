import chalk from 'chalk';

// Force level 1 (Basic colors) or 3 (Truecolor)
chalk.level = 1;

const createLogger = () => ({
  log: (message: any) => {
    const str = typeof message === 'object'
      ? JSON.stringify(message, null, 2)
      : String(message);
    console.log(chalk.magenta(str));
  },
});

export const logger = createLogger();
