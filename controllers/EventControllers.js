const eventModel = require('../model/EventModel')
const {User} = require('../model/UserModel')

module.exports.checkLoginInformations = async (req, res, next) => {
    let body;
    if(req.body === undefined) {
        body = req.session.user;
    } else {
        body = req.body;
    }
    const {userName, userCode } = body;
    const user = await User.find({userName: userName});
    if(userCode === user[0].userCode) {
        res.cookie('userName', userName, {
            maxAge: 60 * 60 * 24 * 1000, 
            secure: true, 
            sameSite: 'none'
        });
        req.session.user = body;
        res.send({response: true});
    } 
    else {
        res.status(404).send({response: false});
    }
}

module.exports.getEvents = async (req, res) => {
    const {q} = req.query;
    const sortCriteria = {}
    let Events = [];
    if(q) {
        q === "beginDate" ? sortCriteria[q] = 1: sortCriteria[q] = -1;      
        Events = await eventModel.find().sort(sortCriteria)
    } else {
        Events = await eventModel.find();
    }
    res.send(Events);
}

module.exports.saveEvent = async (req, res) => {
    if(!req.body.name || !req.body.link || !req.body.description || !req.body.beginDate || !req.body.endDate) {
        res.status(500).end('Not all parameters are provided');
    }
    eventModel
    .create(req.body)
    .then((data) => {
        res.status(200).send(data)
    })
}

module.exports.updateEvent = async (req, res) => {
    if(!req.body._id) res.status(500).end('Not received updated information')
    eventModel
    .findByIdAndUpdate(req.body._id, req.body)
    .then((data) => {
        res.status(201).send(data)
    })
}

module.exports.deleteEvent = async (req, res) => {
    const {id} = req.body;
    if(!id) res.status(400).end("Please give a document id")
    eventModel
    .findByIdAndDelete(id)
    .then((data) => {
        res.status(202).send(data)
    })
    .catch((err) => {
        res.status(404).end('Document not found')
    })
}

module.exports.getEventsByName = async (req, res) => {
    const {name} = req.query;
    if(!name) res.status(400).end('No query name');
    const recherchePattern = new RegExp(name, "i");
    eventModel
    .find({name: recherchePattern})
    .then((data) => {
        res.status(200).send(data)
    })
    .catch((err) => {
        res.status(500).end("Document not found")
    })
}

module.exports.getEventsByType = async (req, res) => {
    const {type} = req.query;
    if(!type) res.status(400).end('No query type');
    eventModel
    .find({name: type})
    .then((data) => {
        res.status(200).send(data)
    })
    .catch((err) => {
        res.status(500).end("Document not found")
    })
}


