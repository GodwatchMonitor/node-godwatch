---
layout: default
---

# Godwatch for node.js

Godwatch is a remote system uptime monitor running with node.js.

Godwatch is modular, meaning each server instance can be enabled to act as a client and report to another dashboard:
```
        Main Server
            |
           / \
          /   \
     Client1  Client2
       |         |
       |      Machines
      / \    [a, b, c ]
     /   \
  Site1  Site2
    |       \
 Machines    \
[a, b, c ]  Machines 
           [a, b, c ]


```

Oh, and by the way IT'S NOT DONE! YAY!!!
Don't use it yet!

//Needs salt (extra salt)

## Installing GodWatch

### Server

To set up, you will need node and mongodb installed. You should also install nodemon to automatically restart the application on uncaught exceptions.

```
git clone https://github.com/Samusoidal/node-godwatch/ godwatch
```

NOTE: The example below is using one terminal window, however, I recommend using screen to manage multiple terminal sessions.

```
cd godwatch
mongodb --dbpath data & nodemon server.js
```

With screen:
```
cd godwatch
screen
mongodb --dbpath data
screen
nodemon server.js
```
You can use CTRL+A then N to switch sessions.

After starting the server, it will run through the configuration process. Follow the prompts to finish the configuration.

//Add link to configuration docs

### Server Administrator

### Client

Text can be **bold**, _italic_, ~~strikethrough~~ or `keyword`.

[Link to another page](./another-page.html).

There should be whitespace between paragraphs.

There should be whitespace between paragraphs. We recommend including a README, or a file with information about your project.

# Header 1

This is a normal paragraph following a header. GitHub is a code hosting platform for version control and collaboration. It lets you and others work together on projects from anywhere.

## Header 2

> This is a blockquote following a header.
>
> When something is important enough, you do it even if the odds are not in your favor.

### Header 3

```js
// Javascript code with syntax highlighting.
var fun = function lang(l) {
  dateformat.i18n = require('./lang/' + l)
  return true;
}
```

```ruby
# Ruby code with syntax highlighting
GitHubPages::Dependencies.gems.each do |gem, version|
  s.add_dependency(gem, "= #{version}")
end
```

#### Header 4

*   This is an unordered list following a header.
*   This is an unordered list following a header.
*   This is an unordered list following a header.

##### Header 5

1.  This is an ordered list following a header.
2.  This is an ordered list following a header.
3.  This is an ordered list following a header.

###### Header 6

| head1        | head two          | three |
|:-------------|:------------------|:------|
| ok           | good swedish fish | nice  |
| out of stock | good and plenty   | nice  |
| ok           | good `oreos`      | hmm   |
| ok           | good `zoute` drop | yumm  |

### There's a horizontal rule below this.

* * *

### Here is an unordered list:

*   Item foo
*   Item bar
*   Item baz
*   Item zip

### And an ordered list:

1.  Item one
1.  Item two
1.  Item three
1.  Item four

### And a nested list:

- level 1 item
  - level 2 item
  - level 2 item
    - level 3 item
    - level 3 item
- level 1 item
  - level 2 item
  - level 2 item
  - level 2 item
- level 1 item
  - level 2 item
  - level 2 item
- level 1 item

### Small image

![Octocat](https://assets-cdn.github.com/images/icons/emoji/octocat.png)

### Large image

![Branching](https://guides.github.com/activities/hello-world/branching.png)


### Definition lists can be used with HTML syntax.

<dl>
<dt>Name</dt>
<dd>Godzilla</dd>
<dt>Born</dt>
<dd>1952</dd>
<dt>Birthplace</dt>
<dd>Japan</dd>
<dt>Color</dt>
<dd>Green</dd>
</dl>

```
Long, single-line code blocks should not wrap. They should horizontally scroll if they are too long. This line should be long enough to demonstrate this.
```

```
The final element.
```
