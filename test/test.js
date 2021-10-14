var should = require("should");
var request = require("request");
var chai = require("chai");
var expect = chai.expect;
var urlBase = "https://api.scaape.online/";
describe("magicthegathering.io API test",function(){
    // the it function do the test, in this case, the endpoint /cards, that should return 100 cards max
    it("Should return all scaapes",function(done){
      request.get(
        {
          url : urlBase + "api/getScaapes"
        },
        function(error, response, body){
  
          // convert the response to json
          var _body = {};
          try{
            _body = JSON.parse(body);
          }
          catch(e){
            _body = {};
          }
  
          // using chai expect function, lets check the result
          expect(response.statusCode).to.equal(200);
  
          // now, we check if the property cards is avaliable
        //   if( _body.should.have.property('cards') ){
        //     // if true, lets check the length
        //     expect(_body.cards).to.have.lengthOf.at.most(100);
        //   }
  
          done(); // callback the test runner to indicate the end...
        }
      );
    })
});