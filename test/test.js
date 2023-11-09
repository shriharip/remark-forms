import fs from 'fs';
import createForm from './../index.js';	
import { fromMarkdown } from 'mdast-util-from-markdown';
import expect from 'expect.js';

const doc = fs.readFileSync('example.md');
const mtree = fromMarkdown(doc);

describe('should create a form', () => {

	it('matches with the html output', async function () {

		let html = await createForm({
			formcss: ['form-horizontal'],
			formaction: '/submit',
			formmethod: 'POST',
			req: 'html'
		})(mtree);

		expect(html).to.eql(`<form class="form-horizontal" action="/submit" method="POST"><div class="text-xl"><label for="nme">Your name</label><input type="" value="nme" name="nme" id="nme" placeholder=""></div><div class="text-xl"><label for="age">Your age</label><input type="number" value="age" name="age" id="age" placeholder=""></div><div class="text-xl"><label for="hear">How did you hear about us</label><select name="hear" id="hear"><option value="google">google</option><option value="">friends</option></select></div><div class=""><label for="msg">Message</label><textarea name="msg" id="msg" placeholder=""></textarea></div><div class=""><label for="news">SignUp for NewsLetter</label><label for="news">yes </label><input id="news" type="checkbox" name="news" value="" checked><label for="news">no</label><input id="news" type="checkbox" name="news" value=""></div><div class=""><label for="val">val</label><input type="submit" value="val"></div></form>
		`);
	});
});
