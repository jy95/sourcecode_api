const chain = require('connect-chain-if');
const {check_credentials_on_exercises} = require("../../controllers/_common/utlis_fct");

const {pass_middleware, check_exercise_state} = require("./common_sub_middlewares");
const check_user_role = require("../check_user_role");

// Arrays for check
const check_credentials_endpoints = ["DeleteExercises", "ChangeExercisesStatus"];

module.exports = (operation) => (req, res, next) => {
    // some endpoints need additional verification before allowing access
    chain([
        chain.if(
            check_credentials_endpoints.includes(operation["x-operation"]),
            // First check that user is allowed to touch these exercises
            (_req, _res, _next) => {
                const ids = (check_credentials_endpoints[0] === operation["x-operation"])
                    ? _req.body
                    : _req.body.exercises;
                check_credentials_on_exercises(_req.user, ids)
                    .then(() => _next())
                    .catch(/* istanbul ignore next */(err) => _next(err));
            },
            pass_middleware
        ),
        // If endpoint === ChangeExercisesStatus, only user must endure another check
        chain.if(
            operation["x-operation"] === "ChangeExercisesStatus",
            check_exercise_state([req.body.state].filter(s => s !== undefined)),
            pass_middleware
        ),
        // If endpoint === createMultipleExercises , we should check the state given in exercise
        chain.if(
            operation["x-operation"] === "createMultipleExercises",
            check_exercise_state(
                // as this endpoint use 2 different schema, extraction is a little different
                Array
                    .from(
                        (req.is("json"))
                            ? req.body
                            : req.body.exercisesData,
                        ex => ex.state
                    )
                    .filter(s => s !== undefined)
            ),
            pass_middleware
        ),
        // If endpoint === createMultipleTags , we should check if the user is authorized to include "state" property
        chain.if(
            operation["x-operation"] === "createMultipleTags",
            (_req, _res, _next) => {
                let allowed = ["user"];
                // state property is reserved for admin only
                if (_req.body.some(t => t.hasOwnProperty("state"))) {
                    allowed.push("admin");
                }
                check_user_role(allowed)(_req, _res, _next);
            },
            pass_middleware
        )
    ])(req, res, (err) => {
        /* istanbul ignore if */
        if (err) {
            next(err);
        } else {
            next();
        }
    });
};
