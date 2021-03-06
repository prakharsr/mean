var config = require('../../config');
var Plan = require('../models/Plan');
var usercontroller = require('./users');
var User = require('../models/User');
var jwt = require('jsonwebtoken');

//http://localhost:8000/api/get/plans

module.exports.getPlans = function(request,response){
    
    var token = usercontroller.getToken(request.headers);
	var user = usercontroller.getUser(token,request,response, function(err, user){
		if(err||!user){
			console.log("User not found");
			res.send({
				success:false,
				msg:err
			});
		}
		else{
            
            var plans = Plan.find({},null, {sort: {cost: 1}},function(err, plans){
                
                if(err){
                    console.log("here" +err);
                }
                else{
                    if(plans.length== 0){
                        plan0 = new Plan({
                            name : "trial",
                            cost : 0,
                            maxUsers : 3,
                            maxAdmins : 1,
                        });
                        plan1 = new Plan({
                            name : "Small",
                            cost : 5000,
                            maxUsers : 2,
                            maxAdmins : 1,
                        });
                        
                        plan2 = new Plan({
                            name : "Medium",
                            cost : 10000,
                            maxUsers : 5,
                            maxAdmins : 2,
                        });
                        
                        plan3 = new Plan({
                            name : "Large",
                            cost : 15000,
                            maxUsers : 11,
                            maxAdmins : 3,
                        });
                        plan0.save();
                        plan1.save();
                        plan2.save();
                        plan3.save();
                        
                        response.send({
                            success:true,
                            plans:[plan0, plan1, plan2, plan3]
                        })
                        
                    }else{
                        response.send({
                            success : true,
                            plans : plans,
                            email: user.email,
                            phone:user.phone
                        }); 
                        
                    }
                    
                }
            });
			
		}
	});	
    
};


