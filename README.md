# Wine-tank assignment optimization

## Install

```
npm install && bower install
```

## Usage

There are 3 main components: the UI, the solver (with its the server), the
instance generator.

In order to interact with the UI, two commands are available:
* `gulp`: compile the LESS and JS into the `dist` directory and minify the
  output, and it will copy all vendor libraries from `bower_components` into the
  `vendor` directory
* `gulp dev`: the same as `gulp` plus `browserSync` and run the solver server.

You should run the `gulp dev` command which should atomatically open the UI for you in
your browser.

If you want to use the solver without the UI, you can use the CLI, with
the command:

```
python solver/solver.py <restart|firstunbound> <data file> [timelimit]
```

Using the CLI, you can only provide JSON formatted data file. The first argument
specify the search strategy:
* *restart*, choose a random variable and assign the max value, with Luby
  restart with factor 2
* *firstunbound*, choose the first unbounded variable and assign the max value.

In general, the second one find a good solution earlier, but it is likely to be
trapped in a local minimum, while the first one tries to escape from them.
Hence, the *firstunbound* strategy is more suitable for big instances, while
*restart* give better results for small instances.

In the `test` folder, there is a test instance generator useful to generate
some random test instances. You can provide it some parameters (try to use it.
It will complain if it doesn't like you).
