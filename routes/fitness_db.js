var mongoose = require('mongoose');
var BioTypeModel = mongoose.model('BiometricType');
var EquipTypeModel = mongoose.model('EquipmentType');
var ExerciseModel = mongoose.model('Exercises');
var ExTypeModel = mongoose.model('ExerciseType');
var MuscleModel = mongoose.model('MuscleGroup');
var UserModel = mongoose.model('User');
var WorkoutModel = mongoose.model('Workout');

// var ProQueModel = mongoose.model('ProQueue');
var ObjectId = mongoose.Types.ObjectId;

var async = require('async');

exports.get_exercises_by_muscle = function(req, res) {
	var muscle = req.query.muscle;

	ExerciseModel.find({ muscle : muscle }).sort({ name : 1 }).exec(
		function(err, result) {
			res.json(result);
		}
	);
};

exports.get_previous_workouts = function(req, res) {
	var curr = req.session.currentUser;
	var today = getTodayDateString();

	WorkoutModel.distinct('workout_id', { user_id : curr._id, date : { $lt : today } }).exec(
		function(err, result) {
			res.json(result.length);
		}
	);
};

exports.get_planned_workouts = function(req, res) {
	var curr = req.session.currentUser;
	var today = getTodayDateString();

	WorkoutModel.distinct('workout_id', { user_id : curr._id, date : { $gte : today }}).exec(
		function(err, result) {
			res.json(result.length);
		}
	);
};

exports.check_existing_workouts = function(req, res) {
	var curr = req.session.currentUser;
	var date = req.query.date;
		
	if(!date) {
		date = getTodayDateString();
	}

	// WorkoutModel.find({ user_id : curr._id, date : { $gte : date } }).exec(
	WorkoutModel.find({ user_id : curr._id, date : date }).exec(
		function(err, result) {
			res.json(result);
		}
	);
};

exports.get_ex_search_results = function(req, res) {
	var query = req.query.query;

	ExerciseModel.find({ $or: [
			{ name : { $regex : query, $options : 'i' } },
			{ exercise_type : { $regex : query, $options : 'i'} },
			{ muscle : { $regex : query, $options : 'i' } },
			{ equip : { $regex : query, $options : 'i' } }
		]}).sort({ name : 1 }).exec(function(err, result) {
			res.json(result);
		}
	);
};

function getTodayDateString() {
	var date = new Date();
	var year = date.getFullYear();
	var day = date.getDate();
	var month = date.getMonth() + 1;

	if(month < 10)
		month = '0' + month;
	var today = month + '/' + day + '/' + year;

	return today;
}

exports.save_workout = function(req, res) {
	var curr = req.session.currentUser;
	var date = req.body.date;
	var exs = req.body.exs;

	WorkoutModel.findOne({ 
		user_id : new ObjectId(curr._id),
		date 	: date
	}, function(err, workout) {
		if(workout != null) {
			workout.exercises = [];
			workout.save();

			for(var i = 0; i < exs.length; i++) {
				addExerciseToWorkout(curr._id, date, exs[i], i);
			}
		} else {
			var wo = new WorkoutModel({
				user_id 	: curr._id,
				date 		: date,
				exercises 	: []
			});

			wo.save(function(err, result) {});

			for(var i = 0; i < exs.length; i++) {
				addExerciseToWorkout(curr._id, date, exs[i], i);
			}
		}

		
	});

	res.json({success : true});
};

function addExerciseToWorkout(id, date, ex, index) {
	var exercise;

	ExerciseModel.findOne({ _id : ex.id }).exec(function(err, exer) {
		if(err)
			throw err;

		if(exer != null) {
			exercise = exer;

			WorkoutModel.findOne({ 
				user_id : new ObjectId(id),
				date 	: date
			}, function(err, workout) {
				workout.exercises.push({
					'_id'			: exercise._id,
					'name' 			: exercise.name,
					'description' 	: exercise.description,
					'muscle' 		: exercise.muscle,
					'equip' 		: exercise.equip,
					'exercise_type' : exercise.exercise_type,
					'video' 		: exercise.video,
					'reps' 			: ex.reps,
					'weight' 		: ex.weight,
					'comments' 		: ex.comment
				});

				workout.save();
			});// WorkoutModel
		}// if(null)
	});// ExerciseModel
}

function getExerciseByID(id) {
	var id = new ObjectId(id);
	var curr = req.session.currentUser;

	async.series([
		function(callback) {
			// delete old workout on date
			WorkoutModel.find({ date : date }).remove();
			callback(null, true);
		},
		function(callback) {
			// create a new workout

			var wo = new WorkoutModel({ 
				user_id 	: curr._id,
				date 		: date,
				exercises 	: []
			});

			wo.save(function(err, result) {});
			// ExerciseModel.findOne({ _id : id }).exec(function(err, result) {
			// 	callback(null, result);
			// });
			callback(null, '');
		},
		function(callback) {
			// push all exercises to workout
			var exs = new Array();

			for(var i = 0; i < exs.length; i++) {

			}


			// callback(null, 'two');
		}
	], 
	function(err, results) {
		console.log(results);
	});
}