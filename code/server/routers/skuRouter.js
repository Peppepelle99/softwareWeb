const express = require('express');
const router = express.Router();
const controlSku = require('../modules/controlSku');
const db = new controlSku('EzWh.db')

// <----------- CONTROL SKU  ----------->


router.get('/skus', async (req, res) => {
    try {
        let skus = [];
        const ids = await db.getSkuIds();
        for (const id of ids) {
            const sku = await db.getSkuById(id);
            skus.push(sku[0]);
        }
        res.status(200).json(skus);
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
})

router.get('/skus/:id', async (req, res) => {

    if (!Number.isInteger(parseInt(req.params.id)))
        res.status(422).json({ error: "id is not a number" }).end();

    try {
        const skus = await db.getSkuById(req.params.id);
        res.status(200).json(skus);
    } catch (err) {
        if (err == "not found")
            res.status(404).json(err).end();
        else
            res.status(500).end();
    }
});

router.get('/skuitems', async (req, res) => {
    try {
        const SKUItemsList = await db.getSKUItems();
        res.status(200).json(SKUItemsList);
    } catch (err) {
        res.status(500).end();
    }
});

router.get('/positions', async (req, res) => {
    try {
        const PositionsList = await db.getPositions();
        res.status(200).json(PositionsList);
    } catch (err) {
        res.status(500).end();
    }
});

router.get('/items', async (req, res) => {
    try {
        const ItemList = await db.getItems();
        res.status(200).json(ItemList);
    } catch (err) {
        res.status(500).end();
    }
});

router.get('/skuitems/sku/:id', async (req, res) => {
    if (id === undefined || id === '') {
        return res.status(422).json({ error: `Invalid SKUId` });    // non da invalid SKUId ma not found
    }

    try {
        const skuitems = await db.getSKUItemsAvailable(id);
        res.status(200).json(skuitems);
    } catch (err) {
        if (err = 'not found')
            res.status(404).json({ error: `no SKU available associated to id` })
        else
            res.status(503).end()
    }
});

router.get('/skuitems/:rfid', async (req, res) => {
    let rfid = req.params.rfid;
    if (rfid === undefined || rfid === '') {
        return res.status(422).json({ error: `Invalid RFID` });    // non da invalid SKUId ma not found
    }

    try {
        const skuitem = await db.getSKUItem(rfid);
        res.status(200).json(skuitem);
    } catch (err) {
        if (err = 'not found')
            res.status(404).json({ error: `no SKUItem associated to RFID` })
        else
            res.status(503).end()
    }
});

router.get('/items/:id', async (req, res) => {
    let id = parseInt(req.params.id);           // mi da gli item nonostante inserisca l'id

    if (id === undefined || id === '' || id === NaN) {
        return res.status(422).json({ error: `Invalid ID` });    // non da invalid ma not found
    }

    try {
        const item = await db.getItem(id);
        res.status(200).json(item);
    } catch (err) {
        if (err = 'not found')
            res.status(404).json({ error: `no item associated to ID` })
        else
            res.status(503).end()
    }
});

//POST

router.post('/sku', async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(422).json({ error: `Empty body request` });
    }
    let sku = req.body;

    if (sku === undefined || sku.description === undefined || sku.weight === undefined || sku.volume === undefined || sku.notes === undefined || sku.price === undefined || sku.availableQuantity === undefined ||
        sku.description == '' || sku.weight == '' || sku.volume === '' || sku.notes == '' || sku.price == '' || sku.availableQuantity === '') {
        return res.status(422).json({ error: `Invalid sku data` });
    }

    try {
        await db.newTableSku();
        await db.createSku(sku);
        return res.status(201).end();
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }

});

router.post('/skuitem', async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(422).json({ error: `Empty body request` });
    }
    let SKUItem = req.body;

    if (SKUItem === undefined || SKUItem.RFID === undefined || SKUItem.SKUId === undefined || SKUItem.DateOfStock === undefined ||
        SKUItem.RIFD === '' || SKUItem.SKUId === '' || SKUItem.DateOfStock === '') {
        return res.status(422).json({ error: `Invalid SKUItem data` });
    }
    if (SKUItem.DateOfStock != null) {
        const isDate = (date) => {
            return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
        }
        if (isDate(SKUItem.DateOfStock) === true) {
            if (SKUItem.DateOfStock.match(/[0-9]{4}[/](0[1-9]|1[0-2])[/](0[1-9]|[1-2][0-9]|3[0-1])/) === null) {
                //it is not a date with format YYYY/MM/DD
                if (SKUItem.DateOfStock.match(/[0-9]{4}[/](0[1-9]|1[0-2])[/](0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]/) === null) {
                    //it is not a date with format YYYY/MM/DD HH:MM
                    return res.status(422).json({ error: `invalid DateOfStock format` });
                }
            }
        }
        else
            return res.status(422).json({ error: `newDateOfStock is not a date` });
    }

    try {
        await db.newTableSKUItem();
        await db.createSKUItem(SKUItem);
        return res.status(201).end();

    } catch (err) {
        res.status(503).end();
    }
});

router.post('/position', async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(422).json({ error: `Empty body request` });
    }
    let position = req.body;

    if (position === undefined || position.positionID === undefined || position.aisleID === undefined || position.row === undefined || position.col === undefined || position.maxWeight === undefined ||
        position.maxVolume === undefined || position.positionID === '' || position.aisleID === '' || position.row === '' || position.col === '' || position.maxWeight === '' || position.maxVolume === '') {
        return res.status(422).json({ error: `Invalid position data` });

    }
    try {
        await db.newTablePosition();
        await db.createPosition(position);
        return res.status(201).end();

    } catch (err) {
        res.status(503).end();
    }
});

router.post('/item', async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(422).json({ error: `Empty body request` });
    }
    let Item = req.body;

    if (Item === undefined || Item.id === undefined || Item.description === undefined || Item.price === undefined ||
        Item.SKUId === undefined || Item.supplierId === undefined || Item.id === '' || Item.description === '' || Item.price === '' ||
        Item.SKUId === '' || Item.supplierId === '') {
        return res.status(422).json({ error: `Invalid Item data` });

    }
    try {
        await db.newTableItem();
        await db.createItem(Item);
        return res.status(201).end();

    } catch (err) {
        res.status(503).end();
    }
});

router.put('/sku/:id', async (req, res) => {
    if (!Number.isInteger(parseInt(req.params.id)))
        res.status(422).json({ error: "id is not a number" }).end();

    if (Object.keys(req.body).length === 0) {
        return res.status(422).json({ error: `Empty body request` });
    }
    let sku = req.body;

    if (sku === undefined || sku.newDescription === undefined || sku.newWeight === undefined || sku.newVolume === undefined || sku.newNotes === undefined || sku.newPrice === undefined || sku.newAvailableQuantity === undefined ||
        sku.newDescription == '' || sku.newWeight == '' || sku.newVolume === '' || sku.newNotes == '' || sku.newPrice == '' || sku.newAvailableQuantity === '') {
        return res.status(422).json({ error: `Invalid sku data` });
    }

    try {
        await db.modifySku(req.params.id, sku);
        //modify position occupied fileds
        res.status(200).end()
    } catch (err) {
        if (err = 'not found')
            res.status(404).json({ error: `wrong id` })
        else
            res.status(503).end()
    }
});

router.put('/sku/:id/position', async (req, res) => {
    if (!Number.isInteger(parseInt(req.params.id)))
        res.status(422).json({ error: "id is not a number" }).end();

    if (Object.keys(req.body).length === 0) {
        return res.status(422).json({ error: `Empty body request` });
    }

    let position = req.body;
    let data;

    if (position === undefined || position.position === undefined || position.position == '') {
        return res.status(422).json({ error: `Invalid position data` });
    }

    try {

        data = await db.getWeightVolume(req.params.id);
        await db.modifySkuPositon(req.params.id, position);
        await db.updateOccupied(data[0], data[1], position, data[2]);
        res.status(200).end()
    } catch (err) {
        if (err == 'not found')
            res.status(404).json({ error: `wrong id` })
        else
            console.log(err);
        res.status(503).json({ err }).end()
    }
});

router.put('/skuitems/:rfid', async (req, res) => {

    if (Object.keys(req.body).length === 0) {
        return res.status(422).json({ error: `Empty body request` });
    }

    const data = req.body;

    if (data === undefined || data.newRFID === undefined || data.newAvailable === undefined || data.newDateOfStock === undefined ||
        req.params.rfid === undefined || data.newRFID === '' || data.newAvailable === '' || data.newDateOfStock === '' || req.params.rfid === '')
        return res.status(422).json({ error: `Invalid data` });
    if (data.newDateOfStock != null) {
        const isDate = (date) => {
            return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
        }
        if (isDate(data.newDateOfStock) === true) {
            if (data.newDateOfStock.match(/[0-9]{4}[/](0[1-9]|1[0-2])[/](0[1-9]|[1-2][0-9]|3[0-1])/) === null) {
                //it is not a date with format YYYY/MM/DD
                if (data.newDateOfStock.match(/[0-9]{4}[/](0[1-9]|1[0-2])[/](0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]/) === null) {
                    //it is not a date with format YYYY/MM/DD HH:MM
                    return res.status(422).json({ error: `invalid newDateOfStock format` });
                }
            }
        }
        else
            return res.status(422).json({ error: `newDateOfStock is not a date` });
    }


    try {
        await db.modifySKUItem(req.params.rfid, data);
        res.status(200).end()
    } catch (err) {
        if (err = 'not found')
            res.status(404).json({ error: `no SKU Item associated to rfid` })
        else
            res.status(503).end()
    }
})

router.put('/position/:positionID', async (req, res) => {

    if (Object.keys(req.body).length === 0) {
        return res.status(422).json({ error: `Empty body request` });
    }

    const data = req.body;
    if (data === undefined || data.newAisleID === undefined || data.newRow === undefined || data.newCol === undefined || data.newMaxWeight === undefined ||
        data.newMaxVolume === undefined || data.newOccupiedWeight === undefined || data.newOccupiedVolume === undefined || req.params.positionID === undefined ||
        data.newAisleID === '' || data.newRow === '' || data.newCol === '' || data.newMaxWeight === '' || data.newMaxVolume === '' || data.newOccupiedWeight === '' ||
        data.newOccupiedVolume === '' || req.params.positionID === '')
        return res.status(422).json({ error: `Invalid data` });

    try {
        await db.modifyPosition(req.params.positionID, data);
        res.status(200).end()
    } catch (err) {
        if (err = 'not found')
            res.status(404).json({ error: `no position associated to positionID` })
        else
            res.status(503).end()
    }
})

router.put('/position/:positionID/changeID', async (req, res) => {

    if (Object.keys(req.body).length === 0) {
        return res.status(422).json({ error: `Empty body request` });
    }

    const newPositionID = req.body.newPositionID;

    if (newPositionID === undefined || req.params.positionID === undefined ||
        newPositionID === '' || req.params.positionID === '')
        return res.status(422).json({ error: `Invalid data` });

    try {
        await db.modifyPositionID(req.params.positionID, newPositionID);
        res.status(200).end()
    } catch (err) {
        if (err = 'not found')
            res.status(404).json({ error: `no position associated to positionID` })
        else
            res.status(503).end()
    }
})

router.put('/item/:id', async (req, res) => {

    if (Object.keys(req.body).length === 0) {
        return res.status(422).json({ error: `Empty body request` });
    }

    const data = req.body;

    if (data === undefined || data.newDescription === undefined || data.newPrice === undefined || req.params.id === undefined ||
        data.newDescription === '' || data.newPrice === '' || req.params.id === '')
        return res.status(422).json({ error: `Invalid data` });

    try {
        await db.modifyItem(req.params.id, data);
        res.status(200).end()
    } catch (err) {
        if (err = 'not found')
            res.status(404).json({ error: `no Item associated to id` })
        else
            res.status(503).end()
    }
})

router.delete('/skus/:id', async (req, res) => {

    if (!Number.isInteger(parseInt(req.params.id)))
        res.status(422).json({ error: "id is not a number" }).end();

    try {
        await db.deleteSku(req.params.id);
        res.status(204).end();
    } catch (err) {
        if (err == "not found")
            res.status(422).json({ error: "id not found" }).end();
        else
            res.status(503).end();
    }
})

router.delete('/deleteSKUItemTable', async (req, res) => {
    try {
        await db.dropSKUItemTable();
        res.status(204).end();
    } catch (err) {
        res.status(500).end();
    }
})

router.delete('/deletePositionTable', async (req, res) => {
    try {
        await db.dropPositionTable();
        res.status(204).end();
    } catch (err) {
        res.status(500).end();
    }
})

router.delete('/deleteItemTable', async (req, res) => {
    try {
        await db.dropItemTable();
        res.status(204).end();
    } catch (err) {
        res.status(500).end();
    }
})

router.delete('/skuitems/:rfid', async (req, res) => {
    const rfid = req.params.rfid;
    if (rfid === undefined || rfid === '')
        return res.status(422).json({ error: `Invalid data` });

    try {
        await db.deleteSKUItem(rfid);
        res.status(204).end()
    } catch (err) {
        res.status(503).end()
    }
})

router.delete('/position/:positionID', async (req, res) => {
    const positionID = req.params.positionID;
    if (positionID === undefined || positionID === '')
        return res.status(422).json({ error: `Invalid data` });

    try {
        await db.deletePosition(positionID);
        res.status(204).end()
    } catch (err) {
        res.status(503).end()
    }
})

router.delete('/items/:id', async (req, res) => {
    const id = req.params.id;
    if (id === undefined || id === '')
        return res.status(422).json({ error: `Invalid data` });

    try {
        await db.deleteItem(id);
        res.status(204).end()
    } catch (err) {
        res.status(503).end()
    }
})

module.exports = router;