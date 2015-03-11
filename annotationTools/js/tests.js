QUnit.test( "hello test", function( assert ) {
    assert.ok( 1 == "1", "Passed!" );
});

QUnit.test( "ReadXML test", function( assert ) {
    var anno_file = "Annotations/example_folder/img1.xml"
    var SuccessFunction = function(xml) {
      console.log("Successfully loaded XML file");
      console.log(xml);
    };
    var FailureFunction = function() {
      console.log("Failed to load XML file");
    };
    ReadXML(anno_file,SuccessFunction,FailureFunction);
    assert.ok( 1 == "1", "Passed!" );
});
