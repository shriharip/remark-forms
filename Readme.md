# remark-forms

remark.js plugin for generating HTML form inputs from markdown.

Generates labels and input controls from markdown links like `[text ?input?](name)`.

## installation

```sh
pnpm install remark-forms
```

## usage

```javascript
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import createForm from 'remark-forms'
import {unified} from 'unified'

const file = await unified()
  .use(remarkParse)
  .use(createForm, {formMethod:''Post', formAction: '/submit', css: ['form-group flex '] })
  .use(rehypeStringify)
  .process('[Your name?text?](name 'val')')

console.log(String(file))

```

## text input

markdown

```md
[Provide a Name ??]()
```

html

```html
<label for="provide-a-name">Provide a Name</label>
<input name="Provide a Name" id="provide-a-name">
```

- `??` at the start of the link text results in an `<input>` with a `<label>` before it.

- `id` and `for` and `name` attributes are derived from the text.

- `id` and `for` are sluglified, `name` is not.

- explicit `id`, `for`, `name` can be specified by doing

```md
[Different label ??](nme)
```

```html
<label for="nme">Different label</label>
<input name="nme" id="nme">
```



## select

markdown

```md
[Choose one ?select?](nme)
- option 1 "val1"
- option 2 "val2"
- option 3
```

html

```html
<label for="nme">Choose one</label>
<select name="nme" id="nme">
<option value="val1">option 1</option>
<option value="val2">option 2</option>
<option value="option 3">option 3</option>
</select>
```

## check list

markdown

```md
[?checklist?](name)
- check1
- check2
- check3
```

html

```html
<label class="checkbox">check1<input type="checkbox" name="name" value="check1"></label>
<label class="checkbox">check2<input type="checkbox" name="name" value="check2"></label>
<label class="checkbox">check3<input type="checkbox" name="name" value="check3"></label>
```

## radio list

markdown

```md
[?radiolist? ](name)
- radio 1 "value1"
- radio 2 "value2"
- radio 3 "value3"
```

html

```html
<label class="radio"><input type="radio" name="name" value="value1">radio 1</label>
<label class="radio"><input type="radio" name="name" value="value2">radio 2</label>
<label class="radio"><input type="radio" name="name" value="value3">radio 3</label>
```

## * for required fields

markdown

```md
[Label Text ??*](Name)
```

html

```html
<label for="name" class="required">Label Text</label>
<input required name="Name" id="name" class="required">
```

## H for hidden fields

markdown

```md
[Label Text ??H](foo)
```


html

```html
<label style="display:none;" for="foo">Label Text</label>
<input style="display:none;" disabled name="foo" id="foo">
```


## CSS styles 

markdown

```md
[?submit? Submit text](- "class1 class2")
```

html

```html
<input type="submit" value="Submit text" class="class1 class2">
```

For more details check out the [example](/example.md).
