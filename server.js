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

app.get('/', async (req, res) => {
    try {
		const client = await pool.connect();
		const result = await client.query('SELECT * FROM salesforce.CTSESTXCHANGE__HerokuTest__c LIMIT 1');
		const results = { 'results': (result) ? result.rows : null};
	
		setTimeout(function afterTwoSeconds() {

			var values = Object.values(results);
			var textFromSfdc = values[0][0].ctsestxchange__title__c;
			let natural = require('natural');
			var classifier = new natural.BayesClassifier();
			var trainingData = [{text:'Surveys',label:'a066A0000023sF0QAI'},
			{text:'Omni Channel/Queue/Routing setup',label:'a066A0000023sF4QAI'},
			{text:'Auto Response Rule/ 3 Workflows/10 Email Templates',label:'a066A0000023sF9QAI'},
			{text:'Web-to-Case and email response',label:'a066A0000023sFEQAY'},
			{text:'Report/Dashboards',label:'a066A0000023sFaQAI'},
			{text:'Reset Password',label:'a066A0000023vt5QAA'},
			{text:'Search Account',label:'a066A0000023vt6QAA'},
			{text:'User registration uniqueness should be checked based on email', label:'a066A0000023vuQQAQ'},
			{text:'User should be provided guidelines during registration process', label:'a066A0000023vuRQAQ'},
			{text:'All Company should have unique registration number', label:'a066A0000023vuSQAQ'},
			{text:'The client must be able to electronically sign and attest the commercial client authorization form.', label:'a066A0000023vuTQAQ'},
			{text:'Each owner and controlling person who completed the individual questionnaire must be able to electronically sign and attest the Data Privacy Notice and Consent for Individuals Completing Individual Questionnaire', label:'a066A0000023vuUQAQ'},
			{text:'Update the Commercial KYA Template', label:'a066A0000023vuVQAQ'},
			{text:'Previous information data capture mechanism should be removed from UI as well as from template', label:'a066A0000023vuWQAQ'},
			{text:'Wherever it is mentioned intermediary, needs to be changed with client', label:'a066A0000023vuYQAQ'},
			{text:'IQ questions need to be deleted from UI as well as template', label:'a066A0000023vuZQAQ'},
			{text:'In commercial UI we can upload list of billers. We need to move that functionality from the submit page to BQ question page',label:'a066A0000023vuaQAA'},
			{text:'Remove CCO from the UI',label:'a066A0000023vubQAA'},
			{text:'Analyse and rewire the internal KYA components to make sure it can handle recertification process for Commercial entities',label:'a066A0000023vucQAA'},
			{text:'The client will be required to input its Legal Entity Name',label:'a066A0000023vudQAA'},
			{text:'The client will be required to input its Trade/DBA name (up to ??)',label:'a066A0000023vueQAA'},
			{text:'The client will be required to input the Type of Entity. If the client selects �Other/Hybrid�, the client will be required to input additional comments in an associated comment field',label:'a066A00000242cMQAQ'},]
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
			});
			
			asyncCall(resultarry);
			res.render('index',{
				results : resultarry
	  		});
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
