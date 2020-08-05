var Generator = require('yeoman-generator');

module.exports = class extends Generator {
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);

    // Next, add your custom code
    this.option('babel'); // This method adds support for a `--babel` flag
  }

  // method1() {
  //   this.log('method 1 just ran');
  // }

  // method2() {
  //   this.log('method 2 just ran');
  // }

  // async prompting() {
  //   this.answers = await this.prompt([
  //     {
  //       name: "cool",
  //       message: "How old are you?"
  //     }
  //   ]);
  // }

  // writing() {
  //   this.log(this.answers.cool, ", 怎么老是你？"); // user answer `cool` used
  // }

  // async prompting() {
  //   this.dep = await this.prompt([
  //     {
  //       type: 'input',
  //       name: "name",
  //       message: "你想安装什么依赖?"
  //     }
  //   ]);
  // }

  // writing() {
  //   // const pkgJson = {
  //   //   devDependencies: {
  //   //     [this.dep.name]: '*'
  //   //   },
  //   // };

  //   // Extend or create package.json file in destination path
  //   this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
  // }

  // install() {
  //   this.npmInstall();
  // }

  // writing() {
  //   this.fs.copyTpl(
  //     this.templatePath('index.html'),
  //     this.destinationPath('public/index.html'),
  //     { title: 'Templating with Yeoman' }
  //   );
  // }

  async prompting() {
    this.answers = await this.prompt([{
      type    : 'input',
      name    : 'title',
      message : 'Your project title',
    }]);
  }

  writing() {
    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('public/index.html'),
      { title: this.answers.title } // user answer `title` used
    );
  }


};