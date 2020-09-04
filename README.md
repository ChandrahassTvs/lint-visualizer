<h1>
  <img align="left" width="40" height="40" src="https://live.staticflickr.com/65535/50304969336_35086b7f64_s.jpg">
	Lint Visualizer
</h1>

> Lint Visualizer provides a smart way to view your project's lint errors & warning as actionable items

<img src="https://live.staticflickr.com/65535/50305182567_f6a8c2d127_h.jpg">

It's time to say BYE BYE! to the old-school terminal based output for your lint errors/warnings. With the all new **Lint Visualizer**, you will now have a clear way to visualize your lint errors/warnings and keep track of them as they are being fixed. Its come with a couple of handy features that helps the developers in clearly working on the errors/warning and also to search for the fix.

> *Currently supports only **Angular** based projects*

## Highlights

- Issues are grouped as Errors/Warnings 
- Resolved issues can be viewed under a sperate section
- Easy to copy the results in **JSON** format
- Search for the issue in google by clicking on the issue title

## Installation

Use the package manager **npm** to install lint-visualizer.

```bash
npm install lint-visualizer
```

## Usage

```
$ lint-visualizer -p <Project Name> [options]
```

The results will be avilable at [http://localhost:8080](http://localhost:8080) once the command is executed successfully 


## Options

| Option | Alias | Description |
| :---: | :---: | :---: |
| `-configuration` | `-c` | Specify the configuration to use |
| `-tslint-config` | `-tc` | The name of the TSLint configuration file |

## Roadmap 🚀

Looking to improve this tool by adding more features going forward as mentioned below:

- Support for the other frameworks and libraries
- Ability to Filter/Sort the results
- Results history with timestamp
- Easy to use light-weight hosted application


## License

![GitHub](https://img.shields.io/github/license/chandrahasstvs/lint-visualizer)
