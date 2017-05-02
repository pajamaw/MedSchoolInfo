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

const request = (function(view) {
  let XHR = XMLHttpRequest,
      BB = view.BlobBuilder || view.WebKitBlobBuilder || view.MozBlobBuilder,
      DOMURL = view.URL || view.webkitURL || view,
      dom_parser = new DOMParser,
      resp_type_supported = "responseType" in new XHR,
      buff_supported,
      blob_supported,
      text_supported,
      doc_supported,
      request = function(opts) {
  		let url = opts.url,
          data = "data" in opts ? opts.data : null,
  			// type can be buffer, blob, text, or document
  			// note that the blob type is unsupported in FF5 without BlobBuilder.js,
          type = opts.type || "buffer",
          blob_req = type === "blob",
          buff_req = type === "buffer",
          binary_req = buff_req || blob_req,
          doc_req = type === "document",
          text_req = type === "text",
          resp_type = type,
          callback = opts.callback,
          onerror = opts.onerror,
          req = new XHR;
  		req.open(data === null ? "GET" : "POST", url, true);
  		if (buff_req || blob_req && !blob_supported) {
  			resp_type = "arraybuffer"
  		}
  		if (doc_req && !doc_supported) {
  			resp_type = "";
  		}
  		req.responseType = resp_type;
  		if (callback) {
  			req.addEventListener("load", function() {
  				let type = req.getResponseHeader("Content-Type"),
  					  data = req.response,
  					  text,
              bb;
  				if (binary_req) {
  					data = data || req.mozResponseArrayBuffer;
  					if (blob_req && !blob_supported) {
  						bb = new BB;
  						bb.append(data);
  						data = bb.getBlob(type);
  					}
  				} else if (text_req) {
  					data = data || req.responseText;
  				} else if (doc_req) {
  					if (!doc_supported) {
  						data = req.responseXML || dom_parser.parseFromString(req.responseText, type);
  					}
  				}
  				callback.call(req, data);
  			}, false);
  		}
  		if (onerror) {
  			req.addEventListener("error", function() {
  				onerror.apply(req, arguments);
  			}, false);
  		}
  		req.send(data);
  		return req;
  	}, test_object_url,
      test_resp_type = function(type) {
  		let test_req = new XHR;
  		test_req.open("GET", test_object_url, false);
  		test_req.responseType = type;
  		test_req.send();
  		return test_req.response !== null;
  	};
    if (resp_type_supported && BB) {
    	test_object_url = DOMURL.createObjectURL((new BB).getBlob("text/html"));
    	buff_supported = test_resp_type("arraybuffer")
    	blob_supported = test_resp_type("blob");
    	text_supported = test_resp_type("text")
    	doc_supported = test_resp_type("document");
    	DOMURL.revokeObjectURL(test_object_url);
    }
    return request;
}(self));



const domParser = new DOMParser();
const comparedSchools = {};

class MedSchool {
  constructor(name, url){
    this.name = name;
    this.url = url;
    this.pageHtml;
    this.bodyHtml;
    this.rank;
  }
}

const req = (u) => request({url: u, data: "text", type: "document"})

const getPageHtml=(school)=>{
  console.log('string html', req(school.url));
  school.pageHtml = req(school.url).responseText;
  console.log(school.pageHtml);
  school.bodyHtml = domParser.parseFromString(school.pageHtml, "text/html");
}

let schools = document.querySelectorAll('#c-main > div.row.title-row > div.data-wrap.c-title-wrap.sorted > h1 > div > div');

console.log('open')

for(let i =0; i<schools.length; i++){
  let web = schools[i].querySelector('span > a').href;
  let schl = schools[i].querySelector('span > a').innerText;
  comparedSchools[web] = new MedSchool(schl, web);
  console.log('created', comparedSchools[web]);
}

Object.keys(comparedSchools).forEach((key)=>{
  console.log(comparedSchools[key])
  getPageHtml(comparedSchools[key])
})

const getRank = (school) => {
  school.rank = document.querySelector('#page-inner > div.grid-wrap.ddc-wrap.clearfix > div.ddc-content.card-content.right > div.ddc-main-sections > section.id-1.detail-section.card-sec.open.section-multi-header.linkable.perma-linkable > div.card-sec-body > div:nth-child(2) > div > div > div.full-split-wrapper.split-wrapper.clearfix > div.full-split-left.full-split-col > div > div > div > div > div > span > div.viz-temp > div > div').innerText
}

// 1. Rank of school
//querySelector('#page-inner > div.grid-wrap.ddc-wrap.clearfix > div.ddc-content.card-content.right > div.ddc-main-sections > section.id-1.detail-section.card-sec.open.section-multi-header.linkable.perma-linkable > div.card-sec-body > div:nth-child(2) > div > div > div.full-split-wrapper.split-wrapper.clearfix > div.full-split-left.full-split-col > div > div > div > div > div > span > div.viz-temp > div > div')
// 2. Tuition - instate
//inner vs. outer
//.querySelector('#page-inner > div.grid-wrap.ddc-wrap.clearfix > div.ddc-content.card-content.right > div.ddc-main-sections > section.id-4.detail-section.card-sec.open.section-multi-header.linkable.perma-linkable > div.card-sec-body > div:nth-child(1) > div > div > div > div.tab-nav-content > div.tab-detail.tab-front > div > div > div > div.full-split-left.full-split-col > div > div:nth-child(2) > div > div:nth-child(1)').outerText

// 3. Tuition - out of state
//actually better than that
//.querySelector('#page-inner > div.grid-wrap.ddc-wrap.clearfix > div.ddc-content.card-content.right > div.ddc-main-sections > section.id-4.detail-section.card-sec.open.section-multi-header.linkable.perma-linkable > div.card-sec-body > div:nth-child(1) > div > div > div > div.tab-nav-content > div.tab-detail.tab-front > div > div > div > div.full-split-left.full-split-col > div > div:nth-child(2) > div > div:nth-child(2)').outerText
// d.parseFromString(blankie.response, "text/html").querySelector('#page-inner > div.grid-wrap.ddc-wrap.clearfix > div.ddc-content.card-content.right > div.ddc-main-sections > section.id-4.detail-section.card-sec.open.section-multi-header.linkable.perma-linkable > div.card-sec-body > div:nth-child(1) > div > div > div > div.tab-nav-content > div.tab-detail.tab-front > div > div > div > div.full-split-left.full-split-col > div > div:nth-child(2) > div > div:nth-child(2) > div > span > div:nth-child(2)').attributes[5].value
// 4. percentage of out of state acceptance
// total acceptance
// .querySelector('#page-inner > div.grid-wrap.ddc-wrap.clearfix > div.ddc-content.card-content.right > div.ddc-main-sections > section.id-3.detail-section.card-sec.section-multi-header.linkable.perma-linkable > div.card-sec-body > div:nth-child(1) > div > div > div.full-split-wrapper.split-wrapper.clearfix > div.full-split-left.full-split-col > div > div > div > div:nth-child(2) > div > span > div:nth-child(2) > div > div').innerText
// total interviews
// .querySelector('#page-inner > div.grid-wrap.ddc-wrap.clearfix > div.ddc-content.card-content.right > div.ddc-main-sections > section.id-3.detail-section.card-sec.section-multi-header.linkable.perma-linkable > div.card-sec-body > div:nth-child(1) > div > div > div.full-split-wrapper.split-wrapper.clearfix > div.full-split-left.full-split-col > div > div > div > div:nth-child(1) > div > span > div.viz-temp > div > div').innerText
// matriculation numbers
// in state - out of state - international
// d.parseFromString(enrollment.innerText, "text/html").querySelectorAll('tbody > tr:nth-child(1) > td')[1-3]
// 5. add new mcat - next to other mcat


// using the request https://gist.github.com/eligrey/1138724
// and also using domparser https://gist.github.com/eligrey/1129031

// okay so viz-zemps are the div's with the average score
//   add the normalized score to that based on the parent title
//   check set the values from aamc
//
// so to use the domparser you have to create a new domparser object
// then after you do that call parseFromString(therequest.response, 'text/html')
// then on that do a `.querySelector(path)`
// find those paths

// one
// also we remove all of the payblockers

//

// h1.c-header div.data div is array
//   then collect each span a.text
//   has the name of the school
