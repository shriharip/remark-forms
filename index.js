/**
 * remark forms plugin
 * lets you create forms in markdown
 * 
 * heavily inspired by marked-forms (Copyright (c) 2015-2022 Jürgen Leschner - github.com/jldec - MIT license)
 * 
 * 
 * shriharip
 *  Copyright (c) 2023-2024 shriharip - github.com/shriharip - MIT license
 */
import { is } from 'unist-util-is';
import { visit } from 'unist-util-visit'
import { h } from 'hastscript'
import { toHtml } from 'hast-util-to-html';

let htree = h('form');	

//simple state machine
let listState = {
	pending: false,
	dtree: {},
	stree: {},
	id: '',
	type: '',
	name: ''
};

const parseLink = (text) => {
  const inputCheck = /^(.*?)\s*\?([^?\s]*)\?(\*?)(X?)(R?)(H?)(\d)?(\d{2,})?(.*)?$/;
  const match = text.match(inputCheck);
  if (match) {
    const [text, type, required, checked, readonly, hidden, minlen, maxlen, placeholder] = match.slice(1);
    return {
      text,
      type,
      required,
      checked,
      readonly,
      hidden,
      minlen,
      maxlen,
      placeholder
    };
  }
  return null;
}


// capture listitems for select, checklist, radiolist
export const listitem = (text, callEndlist) => {
	text = text.replace('\\', ''); // unescape
	
	let valueCheck = text.includes('"');
	let requiredCheck = text.endsWith('X') || text.endsWith('x');

	if (requiredCheck) {
		text = text.slice(0, -1);
	}

	let ind = text.indexOf('"');
	let lastInd = text.lastIndexOf('"');

	let txtval = valueCheck ? text.substring(0, ind - 1) : text;
	let value = valueCheck ? text.substring(ind + 1, lastInd) : '';
	
	renderOption(txtval, value, requiredCheck);
	if (callEndlist) {
		endList();
	}
		
}

export const link = (fullText, name, css) => {
	const { text, type, required, checked, readonly, hidden, minlen, maxlen, placeholder } = parseLink(fullText);

	 renderInput(text, type, required, checked, readonly, hidden, minlen, maxlen, placeholder, name, css);
}

const renderInput = (text, type, required, checked, readonly, hidden, minlen, maxlen, placeholder, name, css) => {

	type = type === 'checklist' ? 'checkbox' : type === 'radiolist' ? 'radio' : type;

	let div = {
		type: 'element',
		tagName: 'div',
		properties: { className: [css] },
		children: []
	}

	let label = {
		type: 'element',
		tagName: 'label',
		properties: {}
	};
	
	let id = name && name != '-' ? name.toLowerCase().replace(/[^\w]+/g, '-') : text ? text.toLowerCase().replace(/[^\w]+/g, '-') : '';

	label.properties['for'] = id;
	label['children'] = [
		{
			type: 'text',
			value: text || name || ''
		}
	]
	div.children.push(label);

	let input = {
		type: 'element',
		tagName: 'input',
		properties: {
			type: type,
			value: id,
		},
	};

	let textarea = {
		type: 'element',
		tagName: 'textarea',
		properties: {},
	};

	if (minlen) {
		if (type === 'date' || type === 'range' || type === 'number' || type === 'time' || type === 'month' || type === 'week' || type === 'datetime-local') {
			input.properties.min = minlen;
		} else if (type === 'email' || type === 'url' || type === 'tel' || type === 'search' || type === 'password' || type === 'text') {
			input.properties.minlength = minlen
		}
	}

	if (maxlen) {
		if (type === 'date' || type === 'range' || type === 'number' || type === 'time' || type === 'month' || type === 'week' || type === 'datetime-local') {
			input.properties.max = maxlen;
		} else if (type === 'email' || type === 'url' || type === 'tel' || type === 'search' || type === 'password' || type === 'text') {
			input.properties.maxlength = maxlen
		}
	}

  

	if (!(type === 'submit' || type === 'button' || type === 'hidden' || type === 'select' || type === 'textarea' || type === 'label' || type === 'select' || type === 'checkbox' || type === 'radio' )) {

		input.properties['name'] = name && name != '-' ? name : text ? text : '';
		input.properties['id'] = id;
		input.properties.placeholder = placeholder ? placeholder : '';
		input.properties.required = required ? required : '';
		input.properties.readonly = readonly ? readonly : '';	
		input.properties.hidden = hidden ? hidden : '';
		input.properties.disabled = hidden ? 'disabled' : '';
		input.properties.checked = checked;
		div.children.push(input);
	} 
	
	if (type === 'submit' || type === 'button') {	
		input.properties.disabled = hidden ? 'disabled' : '';
		div.children.push(input);
	}
	
	if (type === 'textarea') {
		textarea.properties['name'] = name && name != '-' ? name : text ? text : '';
		textarea.properties.id = id;
		textarea.properties.placeholder = placeholder ? placeholder : '';
		textarea.properties.required = required ? required : '';
		textarea.properties.readonly = readonly ? readonly : '';
		textarea.properties.hidden = hidden ? hidden : '';
		textarea.properties.disabled = hidden ? 'disabled' : '';

		div.children.push(textarea);
	}

	let select = {
		type: 'element',
		tagName: 'select',
		properties: {},
		children: []
	};

	if (type === 'select' || type === 'checkbox' || type === 'radio') {
		
		if (type === 'select') {
		select.properties['name'] = name && name != '-' ? name : text ? text : '';
		select.properties['id'] = id;
		select.children = [];

			startList(id, type, name, div, select);
		} else {
			startList(id, type, name, div);
		}
		return
	}
	htree.children.push(div);
}

const renderOption = (text, value, checked) => {

	let option = {
    type: "element",
    tagName: "option",
    properties: {}
  }

let inputItem = {
  type: "element",
  tagName: "input",
  properties: {}
}

  let labelItem = {
    type: "element",
    tagName: "label",
		properties: {},
  }



	if (listState.type === 'select') {
		option.properties['value'] = value;
		checked ? option.properties.selected : '';
		option.children = [{
			type: "text",
			value: text,
			properties: {}
		}
		]
	listState.stree.children.push(option);

	} else {

		labelItem.children = [{
			type: "text",
			value: text,
			properties: {}
		}
		]
		labelItem.properties.for = listState.name;

		inputItem.properties['id'] = listState.id;
		inputItem.properties['type'] = listState.type;
		inputItem.properties['name'] = listState.name;
		inputItem.properties['value'] = value
		inputItem.properties['checked'] = checked;

		listState.dtree.children.push(labelItem);
		listState.dtree.children.push(inputItem);

	}
}

const startList = (id, type, name, dnode, snode) => {
	listState.pending = true,
		listState.dtree = dnode ? dnode : {},
		listState.stree = snode ? snode : {},
		listState.id = id,
		listState.type = type,
		listState.name = name
}

const endList = () =>{
	if (listState.pending) {
		if (listState.type === 'select') {
			listState.dtree.children.push(listState.stree);
			htree.children.push(listState.dtree);
		} else {
			htree.children.push(listState.dtree);
		}
		listState.dtree = {};
		listState.stree = {};
		listState.id = '';
		listState.type = '';
		listState.name = '';
		listState.pending = false;
	}  else {
		return;
	}
}


/// Constants for special link types
const SPECIAL_LINK_TYPES = ['select', 'checklist', 'radiolist'];

/// Check if the link is a special type and if it is then we will use listitem to process them later on
const isSpecialLinkType = (text)=> {
  return SPECIAL_LINK_TYPES.some(type => text.includes(type));
}


const processLink = (node) =>{
  const text = node.children[0].value;
  //link(textforlabel, name , css)
  link(text, node.url, node.title)
}

const processMarkdownLink = (node) => {
	if (is(node, { type: 'link' })) {
		const text = node.children[0].value;
    if (!isSpecialLinkType(text)) {
    	 processLink(node);
    }
  }
}

const processListItems = (node) => {
	if (is(node, { type: 'list' })) {
		let childrenLength = node.children.length;
		node.children.forEach((child, index) => {
			
			let callEndlist = index === childrenLength - 1;
      if (is(child, { type: 'listItem' })) {
        const nodePara = child.children[0];
        const nodeLinkText = nodePara.children[0];

        if (is(nodeLinkText, { type: 'link' })) {
					processLink(nodeLinkText)
				}
				if (is(nodeLinkText, { type: 'text' })) {
			 		listitem(nodeLinkText.value, callEndlist )
		 }
      }
    });
  }
}

export default function createForm(opts = {}) {

	let customcss = [];
	if (opts.formcss) {
		customcss = [...opts.formcss];
	} else {
		customcss = ['form-group'];
	}
	// Set the form properties
	htree.properties.className = [...customcss];
	htree.properties.action = opts.formaction || '';
	htree.properties.method = opts.formmethod || 'POST';


	return async function (tree){
		visit(tree, (node) => {
			processMarkdownLink(node);
			processListItems(node);
		});

		if(opts.req === 'html') {
			return toHtml(htree);
		} else {
			return htree;
		}
		
	}


}

