var express = require('express');
var app = express();
var port = process.env.PORT || 5000;
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://puzegirzqdiqxo:173d530a5408dd69340a67e8fe13873232f30db79235f1e4351269ed43317c4e@ec2-54-235-86-226.compute-1.amazonaws.com:5432/d301ivdjl55lg6',
  ssl: true
});

app.get('/data', async (req, res) => {
    try {
		const client = await pool.connect(); 
		const result = await client.query('SELECT * FROM salesforce.CTSESTXCHANGE__HerokuTest__c LIMIT 1');
		const results = { 'results': (result) ? result.rows : null};
	
		setTimeout(function afterTwoSeconds() {

			var values = Object.values(results);
			var textFromSfdc = values[0][0].ctsestxchange__title__c;
			let natural = require('natural');
			var classifier = new natural.BayesClassifier();
			var trainingData = [{text:'test',label:'a056A00000Kb245QAB'},
			{text:'Test Use Case',label:'a056A00000HvNtJQAV'},
			{text:'Allow user to search company record.',label:'a056A00000Hv07PQAR'},
			{text:'FRN should be of 11 digits including alphanumeric characters only.',label:'a056A00000Hv07QQAR'},
			{text:'Show help text for all the required fields on the form.',label:'a056A00000Hv07RQAR'},
			{text:'Ability to verify FRN number against centralize DB.',label:'a056A00000Hv07SQAR'},
			{text:'Show error message if multiple companies found for same FRN.',label:'a056A00000Hv07TQAR'},
			{text:'User registration uniqueness should be checked based on email', label:'a066A0000023vuQQAQ'},
			{text:'test2', label:'a056A00000Kb24AQAR'},
			{text:'test3', label:'a056A00000Kb24KQAR'}]
			var testData = [ { text: textFromSfdc,label:''}, ]
			trainingData.forEach(item => {classifier.addDocument(item.text, item.label);});  
			classifier.train();
			
			var resultarry = [];
			testData.forEach(item =>{
				var labelGuess = classifier.classify(item.text);
				console.log('\n', item.text);
				console.log('label',labelGuess);
				console.log(classifier.getClassifications(item.text));
				resultarry.push(item.text);
				resultarry.push(labelGuess);
				resultarry.push(classifier.getClassifications(item.text));
			});
			
			//asyncCall(resultarry);
			//res.render('index',{
				//results : resultarry
	  		//});
			 res.status(200).json(resultarry);
		}, 500)
		
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  

async function asyncCall(resultarry) {
  	console.log('calling =>'+ resultarry);
  	var test = resultarry[1];
  	const client = await pool.connect();
	const updateresult = await client.query("BEGIN; SET LOCAL myvars.myid = "+test+"; UPDATE salesforce.CTSESTXCHANGE__HerokuTest__c SET CTSESTXCHANGE__ResultSet__c = current_setting('myvars.myid')::text; COMMIT; ");
	const updateresults = { 'results': (updateresult) ? updateresult.rows : null};
	client.release();
	console.log(updateresults);
}

app.listen(port, function() {
	console.log('Our app is running on http://localhost:' + port);
});
