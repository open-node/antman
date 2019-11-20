# ant-man
Debug node.js process by client REPL on net socket and is silent.

[![Build status](https://travis-ci.com/open-node/ant-man.svg?branch=master)](https://travis-ci.org/open-node/ant-man)
[![codecov](https://codecov.io/gh/open-node/ant-man/branch/master/graph/badge.svg)](https://codecov.io/gh/open-node/ant-man)

# Installation
<pre>npm i ant-man --save</pre>

# Usage
* your node.js process code
<pre>
const antman = require('ant-man');

// regist variable on agents object
antman.regist('key', value, 'description');

// start debugger server
antman.start(listen, secret, { expire: 30 * 60 });
</pre>

* Execute the following command then enter REPL mode to debug
<pre>
antman --listen 9085
</pre>

* REPL debugger mode
<pre>
`$` is the agent whose be debugged node.js process
`help` is tips info for you
<pre>
