import chalk from 'chalk';
import { Command } from 'commander';
import fse from 'fs-extra';
import path from 'path';
import spawn from 'cross-spawn';

const dependencies = ['react', 'react-dom', 'react-scripts'];
const templateName = 'AppTemplate';

export const init = async() => {
   console.log(chalk.yellowBright.bold('starting Application setup...'));
   const program = new Command('SampleApp');
   let directoryName = null;
   try {
    program.exitOverride();
    program
    .argument('<folder_name>')
    .description('Please provide folder name to create')
    .action((name)=> {
      directoryName = name;
    })
    .parse(process.argv);
   } catch(e) {
    console.error(chalk.redBright('Example: CreateApp myFolder'));
   }
   
   program.showHelpAfterError();
   const directory = await createFolderStructure(directoryName);
   console.log(`Folders are created in ${chalk.green(directory)}.`);
   process.cwd(directory);
  const child = spawn('npm', ['start'], { stdio: 'inherit' });
    child.on('close', code => {
      if (code !== 0) {
        console.error('There is a error in starting the application');
        return;
      }
    });
}

const getPackageJson = (name) => {
  return {
      name,
      version: '1.0.0',
      private: true,
      scripts: {
        start: 'react-scripts start',
        build: 'react-scripts build',
        test: 'react-scripts test'
      }
  }
};

const createFolderStructure = async (name) => {
    if(!name) process.exit(1);

    const root = path.resolve(name);
    fse.ensureDirSync(name);
    fse.writeFileSync(
        path.join(root, 'package.json'),
        JSON.stringify(getPackageJson(name), null, 2)
    );

    const templatePath = path.resolve(templateName);
    const templateDir = path.join(templatePath, 'template');
    if (fse.existsSync(templateDir)) {
        fse.copySync(templateDir, root);
    } else {
        console.error(
        `Could not locate supplied template: ${chalk.green(templateDir)}`
        );
        return;
    }
    process.chdir(root);
    await installPackages(root, dependencies);
    return root;
}

const isUsingYarn = () => {
  return (process.env.npm_config_user_agent || '').indexOf('yarn') === 0;
}

const installPackages = (root, dependencies) => {
  return new Promise((resolve, reject) => {
    let command;
    let args;
    if (isUsingYarn()) {
      command = 'yarnpkg';
      args = ['add'].concat(dependencies);
      args.push(root);
    } else {
      command = 'npm';
      args = [
        'install'
      ].concat(dependencies);
    }

    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', code => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`,
        });
        return;
      }
      resolve();
    });
  });
}

