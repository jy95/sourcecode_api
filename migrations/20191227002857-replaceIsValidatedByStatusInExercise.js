'use strict';

let opts = {tableName: 'Exercises'};
const enumObj = require("../controllers/_common/exercise_status");
let enumValues = Object.values(enumObj);

module.exports = {
    up: (queryInterface, Sequelize) => {
        if (queryInterface.sequelize.options.schema) {
            opts.schema = queryInterface.sequelize.options.schema;
        }
        return Promise.all([
            queryInterface.removeColumn(opts, "isValidated"),
            queryInterface.addColumn(opts, "state", {
                type: Sequelize.ENUM(enumValues),
                defaultValue: enumObj.PENDING
            })
        ]);
    },

    down: (queryInterface, Sequelize) => {
        if (queryInterface.sequelize.options.schema) {
            opts.schema = queryInterface.sequelize.options.schema;
        }
        return Promise.all([
            queryInterface.removeColumn(opts, "state")
        ]);
    }
};