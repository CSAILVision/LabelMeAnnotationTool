QUnit.test( "hello test", function( assert ) {
    assert.ok( 1 == "1", "Passed!" );
});

QUnit.test( "ReadXML test", function( assert ) {
    var done = assert.async();
    var anno_file = "Annotations/example_folder/img1.xml"
    var SuccessFunction = function(xml) {
      assert.ok(true,"Successfully loaded XML file");
      LM_xml = xml;
      SetAllAnnotationsArray();
      var pts_x = Array(1078, 1123, 1126, 1078);
      var pts_y = Array(858, 854, 937, 940);
      var passed_test = true;
      for(var i = 0; i < pts_x.length; i++) {
	if(AllAnnotations[0].pts_x[i] != pts_x[i]) {
	  passed_test = false;
	}
	if(AllAnnotations[0].pts_y[i] != pts_y[i]) {
	  passed_test = false;
	}
      }
      assert.ok( passed_test, "Passed polygon coordinate test." );
      done();
    };
    var FailureFunction = function() {
      assert.ok( false, "Failed to load XML file" );
    };
    ReadXML(anno_file,SuccessFunction,FailureFunction);
});

QUnit.test( "LMgetObjectField test", function( assert ) {
    var done = assert.async();
    var anno_file = "Annotations/example_folder/img1.xml"
    var SuccessFunction = function(xml) {
      assert.ok(true,"Successfully loaded XML file");
      LM_xml = xml;
      var passed_test = true;
      console.log(LMgetObjectField(LM_xml, 0, 'username'));
      if ('admin' !=LMgetObjectField(LM_xml, 0, 'username')) passed_test = false;
      assert.ok( passed_test, "Passed username test." );
      test_x = LMgetObjectField(LM_xml, 0, 'x');
      test_y = LMgetObjectField(LM_xml, 0, 'y');
      var pts_x = Array(1078, 1123, 1126, 1078);
      var pts_y = Array(858, 854, 937, 940);
      
      for(var i = 0; i < pts_x.length; i++) {
  if(test_x[i] != pts_x[i]) {
    passed_test = false;
  }
  if(test_y[i] != pts_y[i]) {
    passed_test = false;
  }
      }
      assert.ok( passed_test, "Passed coordinate getting test." );
      done();
    };
    var FailureFunction = function() {
      assert.ok( false, "Failed to load XML file" );
    };
    ReadXML(anno_file,SuccessFunction,FailureFunction);
});