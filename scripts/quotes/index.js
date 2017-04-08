'use strict';

// Entry point for the database-backed "quotefile" management API.

const {DocumentSet} = require('./model');
const Storage = require('./storage');
const {generate} = require('./commands');
const {Anyone} = require('../roles');

function populateCommand(name, command) {
  if (command === undefined || command === null || command === false) {
    return null;
  }

  const populated = Object.assign({}, command === true ? {} : command);

  if (populated.role === undefined) {
    populated.role = Anyone;
  }

  if (populated.defaultToSelf === undefined) {
    populated.defaultToSelf = false;
  }

  return populated;
}

// Initialize commands related to a set of documents based on a spec.
exports.createDocumentSet = function createDocumentSet(robot, name, commands) {
  const plural = commands.plural || `${name}s`;
  const nullBody = commands.nullBody || `I don't know any ${plural} that contain that!`;

  const spec = {
    name,
    nullBody,
    plural,
    features: {
      add: populateCommand(name, commands.add),
      set: populateCommand(name, commands.set),
      query: populateCommand(name, commands.query),
      count: populateCommand(name, commands.count),
      stats: populateCommand(name, commands.stat),
      by: populateCommand(name, commands.by),
      about: populateCommand(name, commands.about),
      kov: populateCommand(name, commands.kov)
    }
  };

  const storage = new Storage({db: robot.postgres});
  const documentSet = new DocumentSet(storage, spec.name, spec.nullBody);

  generate(robot, documentSet, spec);

  return documentSet;
}
