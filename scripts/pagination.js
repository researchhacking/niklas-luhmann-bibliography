const set_pagination = e => {
  let total_num = e.detail.result.numberOfResults;
  let pages_num  = Math.ceil(total_num / 50);
  let q = e.detail.query;
  let current_page = parseInt(q.page ?? 1);
  let divs = document.querySelectorAll('div.pagination');
  divs.forEach(div => {
    let str = '';
    str += `<div class="title">Page ${current_page} of ${pages_num}</div>`;
    str += `<div class="links">`;
    if(current_page > 1) str += `<a href="${current_page-1}">&lt;&lt;</a>`;
    [...Array(pages_num).keys()]
      .filter(i => i < current_page+4 && i > current_page-6)
      .forEach(i => {
        str += (i+1 != current_page) ? `<a href="${i+1}">${i+1}</a>` : `<span>${current_page}</span>`;
    });
    if(current_page < pages_num) str += `<a href="${current_page+1}">&gt;&gt;</a>`;
    str += `</div>`;
    div.innerHTML = str;
  });
};

const pagination_click = e => {
  e.preventDefault();
  let page_num = parseInt(e.target.attributes['href'].value);
  let event = new CustomEvent('pagination', {detail: page_num});
  document.dispatchEvent(event);
};

document.addEventListener('DOMContentLoaded', e => {
  let divs = document.querySelectorAll('div.pagination');
  divs.forEach(div => {
    div.addEventListener('click', pagination_click);
  });
  // custom events
  document.addEventListener('searchresult', set_pagination);
});