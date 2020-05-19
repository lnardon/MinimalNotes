var toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],        
  ['blockquote', 'code-block'],
  [{ 'header': 1 }, { 'header': 2 }],               
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],      
  [{ 'indent': '-2'}, { 'indent': '+2' }],          
  [{ 'direction': 'rtl' }],                         
  [{ 'size': ['small', false, 'large', 'huge'] }],  
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'align': [] }],
  ['link', 'image'],
];

var quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar: toolbarOptions
  }
});

var n = true;

function toggleNavbar () {
  n = !n;
  if (n) {
    document.getElementById("navbar").style.display = 'none';
  } else {

    document.getElementById("navbar").style.display = 'flex';
  }
}


// black and white
function blackAndWhitTheme() {
  document.getElementById('editor').style.setProperty('--main-color', '#F7F7F7')
  document.getElementById('editorContainer').style.setProperty('--main-color', '#F7F7F7')
}

