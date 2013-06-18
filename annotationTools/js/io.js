function ReadXML(xml_file,SuccessFunction,ErrorFunction) {
  $.ajax({
    type: "GET",
    url: xml_file,
    dataType: "xml",
    success: SuccessFunction,
    error: ErrorFunction
  });
}
