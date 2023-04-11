import ora from 'ora';

// loading 效果
export const waitFnloading =
  (fn, message) =>
  async (...args) => {
    const spinner = ora(message);
    spinner.start();
    const result = await fn(...args);
    spinner.succeed();
    return result;
  };
