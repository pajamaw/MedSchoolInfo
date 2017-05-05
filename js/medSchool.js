// trying to keep everything concise in one place
(function(DOMParser) {

	let DOMParser_proto = DOMParser.prototype,
     real_parseFromString = DOMParser_proto.parseFromString;

	try {
		// WebKit returns null on unsupported types
		if ((new DOMParser).parseFromString("", "text/html")) {
			// text/html parsing is natively supported
			return;
		}
	} catch (ex) {}

	DOMParser_proto.parseFromString = function(markup, type) {
		if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
			let doc = document.implementation.createHTMLDocument("");
	      		if (markup.toLowerCase().indexOf('<!doctype') > -1) {
        			doc.documentElement.innerHTML = markup;
      			}
      			else {
        			doc.body.innerHTML = markup;
      			}
			return doc;
		} else {
			return real_parseFromString.apply(this, arguments);
		}
	};
}(DOMParser));

const makeRequest = (obj) => {
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.open(obj.method || "GET", obj.url);
		if (obj.headers) {
			Object.keys(obj.headers).forEach(key => {
				xhr.setRequestHeader(key, obj.headers[key]);
			});
		}
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve(xhr.response);
			} else {
				reject(xhr.statusText);
			}
		};
		xhr.onerror = () => reject(xhr.statusText);
		xhr.send(obj.body);
	});
};
// Example:

const req = (url) => makeRequest({"url": url, method: "GET"});

const domParser = new DOMParser();
const comparedSchools = {};

class MedSchool {
  constructor(name, url, position){
    this.name = name;
    this.url = url;
		this.position = position;
    this.pageHtml;
    this.bodyHtml;
    this.rank;
		this.position;
		this.inStateTuition;
		this.outStateTution;
		this.OutSmatricu;
		this.interSmatricu;
		this.inSmatricu;
		this.totalAcceptance;
		this.totalInterviews;
  }
}

const getPageHtml=(school)=>{
	return new Promise((resolve, reject) => {
		let responseT = req(school.url);
		responseT.then((x)=>{
			school.pageHtml = x;
			school.bodyHtml = domParser.parseFromString(school.pageHtml, "text/html");
			// console.log(school.bodyHtml);
			getSchoolData(school);
			createDivs(school);
		})
	});
}

let schools = document.querySelectorAll('#c-main > div.row.title-row > div.data-wrap.c-title-wrap.sorted > h1 > div > div');

console.log('open')

for(let i =0; i<schools.length; i++){
  let web = schools[i].querySelector('span > a').href;
  let schl = schools[i].querySelector('span > a').innerText;
  comparedSchools[web] = new MedSchool(schl, web, i);
  console.log('created', comparedSchools[web]);
}

Object.keys(comparedSchools).forEach((key)=>{
  console.log(comparedSchools[key])
  getPageHtml(comparedSchools[key])
})
setTimeout((x)=>{
	console.log('bye bye ads')
	document.querySelector('body').classList.remove("BOX-open");
	document.querySelector('div.BOX-wrap').style.zIndex = "-1";
}, 10000)

const getSchoolData = (school) => {
	getRank(school)
	console.log('got rank')
	getTuition(school)
	console.log('got tuition')
	getMatriculant(school)
	console.log('got matriculatnt')
}
const getRank = (school) => {
  school.rank = school.bodyHtml.querySelector('#page-inner > div.grid-wrap.ddc-wrap.clearfix > div.ddc-content.card-content.right > div.ddc-main-sections > section.id-1.detail-section.card-sec.open.section-multi-header.linkable.perma-linkable > div.card-sec-body > div:nth-child(2) > div > div > div.full-split-wrapper.split-wrapper.clearfix > div.full-split-left.full-split-col > div > div > div > div > div > span').innerText.substring(10)
}
const getTuition = (school) => {
	school.inStateTuition = school.bodyHtml.querySelector('#page-inner > div.grid-wrap.ddc-wrap.clearfix > div.ddc-content.card-content.right > div.ddc-main-sections > section.id-4.detail-section.card-sec.open.section-multi-header.linkable.perma-linkable > div.card-sec-body > div:nth-child(1) > div > div > div > div.tab-nav-content > div.tab-detail.tab-front > div > div > div > div.full-split-left.full-split-col > div > div:nth-child(2) > div > div:nth-child(1)').outerText;
 	school.outStateTution = school.bodyHtml.querySelector('#page-inner > div.grid-wrap.ddc-wrap.clearfix > div.ddc-content.card-content.right > div.ddc-main-sections > section.id-4.detail-section.card-sec.open.section-multi-header.linkable.perma-linkable > div.card-sec-body > div:nth-child(1) > div > div > div > div.tab-nav-content > div.tab-detail.tab-front > div > div > div > div.full-split-left.full-split-col > div > div:nth-child(2) > div > div:nth-child(2)').outerText;
}
const getMatriculant = (school) => {
	let matriculationDataHtml = school.bodyHtml.querySelector('#page-inner > div.grid-wrap.ddc-wrap.clearfix > div.ddc-content.card-content.right > div.ddc-main-sections > section.id-3.detail-section.card-sec.open.section-multi-header.linkable.perma-linkable > div.card-sec-body > div:nth-child(9) > div > div > div.full-split-left.full-split-col > div > div.c-structure.sj-43681.component.softjoin > div > div > div > noscript > table')
	let parsedMatric = domParser.parseFromString(matriculationDataHtml, "text/html");

	school.totalAcceptance = school.bodyHtml.children["0"].children[1].children["0"].children[1].children.page.children["page-inner"].children[3].children[2].children[2].children[6].children[1].children["0"].children["0"].children[1].children[2].children[1].children["0"].children["0"].children["0"].children[1].innerText
	school.totalInterviews = school.bodyHtml.children["0"].children[1].children["0"].children[1].children.page.children["page-inner"].children[3].children[2].children[2].children[6].children[1].children["0"].children["0"].children[1].children[2].children[1].children["0"].children["0"].children["0"].children["0"].innerText
	school.inSmatricu = parsedMatric.querySelectorAll('tbody > tr:nth-child(1) > td')[1] || "/na"
	school.OutSmatricu = parsedMatric.querySelectorAll('tbody > tr:nth-child(1) > td')[2] || "/na"
	school.interSmatricu = parsedMatric.querySelectorAll('tbody > tr:nth-child(1) > td')[3] || "/na";
}


const createDivs = (school) => {
	let schoolHtml = document.querySelectorAll('h1.c-header div.data div'),
	  list = document.createElement('ul'),
		listItems = {
			rank:`Rank #${school.rank}`,
			inState: `${school.inStateTuition}`,
			outState: 	`${school.outStateTution}`,
			acceptance: 	`${school.totalAcceptance}`,
			outStateMat: 	`Out State: ${school.OutSmatricu}`,
			inStateMat: `In State: ${school.inSmatricu}`,
			InterStateMat: `International: ${school.interSmatricu}`
		};
	schoolHtml[school.position].querySelector('span').appendChild(list)
	Object.keys(listItems).forEach((k)=>{
		let node = document.createElement('li'),
				textNode = document.createTextNode(listItems[k]);
		node.appendChild(textNode);
		list.appendChild(node);
	})
}
