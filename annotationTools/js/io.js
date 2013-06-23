function ReadXML(xml_file,SuccessFunction,ErrorFunction) {
  $.ajax({
    type: "GET",
    url: xml_file,
    dataType: "xml",
    success: SuccessFunction,
    error: ErrorFunction
  });
}

function WriteXML(url,xml_data,SuccessFunction,ErrorFunction) {
  $.ajax({
    type: "POST",
    url: url,
    data: (new XMLSerializer()).serializeToString(xml_data).replace(' xmlns="http://www.w3.org/1999/xhtml"',''),
    contentType: "text/xml",
    dataType: "text",
    success: SuccessFunction,
    error: function(xhr,ajaxOptions,thrownError) {
      console.log(xhr.status);          
      console.log(thrownError);
    }
  });
}
