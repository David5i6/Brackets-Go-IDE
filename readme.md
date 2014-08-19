# Go - IDE
##### Brackets Go-IDE plugin
----
This is a little project to develop a IDE functionality for Go language on top of brackets.

Actually it uses ``gocode`` for autocompletion, so you need to get and install it.

It also adds some hints by itself (go-lang internal functions and primitives not suggested by ``gocode`` ).


You can get ``gocode`` here: 

https://github.com/nsf/gocode

### A note on Mac OS X

On Mac OS X, user defined path and variables are not avaiable to windowed applications, so you ned to launch Brackets from command line instead of double-click its icon.

Also if your go working directory is in a directory called go on your user directory (I strongly recommend this), the plugin will try to detect it.

### Screenshot

![go-ide](https://raw.githubusercontent.com/David5i6/wiki/master/goide/v0.0.4.png)

