import ObjectFunctions from './ObjectFunctions.js';

export default class ObjectFactory {
    static CreateObject(objectID, orientation, oldObject) {
        let object;
        if (!oldObject) {
            // new object
            object = { objectID: objectID, orientation: orientation };
        }
        else {
            // modified object (for changing state)
            object = oldObject;
            object.objectID = objectID;
            object.orientation = orientation;
        }
        switch (objectID) {
            // Block
            case 0:
                object.activeFunction = ObjectFunctions.BlockFall;
                break;

            // Exit
            case 1:
                object.activeFunction = ObjectFunctions.Exit;
                break;

            // Sensor Off
            case 2:
                object.activeFunction = ObjectFunctions.SensorIdle;
                object.inactiveFunction = ObjectFunctions.SensorToggle;
                object.connect = ObjectFunctions.SensorConnect;
                break;

            // Sensor On
            case 3:
                object.activeFunction = ObjectFunctions.SensorToggle;
                object.inactiveFunction = ObjectFunctions.SensorOff;
                object.connect = ObjectFunctions.SensorConnect;
                break;

            // Laser Off
            case 4:
                object.activeFunction = null;
                object.inactiveFunction = ObjectFunctions.LaserFire;
                object.createObject = ObjectFactory.CreateObject(9, orientation);
                break;

            // Laser On
            case 5:
                object.activeFunction = ObjectFunctions.LaserFire;
                object.inactiveFunction = ObjectFunctions.LaserFire;
                object.createObject = ObjectFactory.CreateObject(9, orientation);
                break;

            // Piston Off
            case 6:
                object.activeFunction = ObjectFunctions.PistonRetract;
                object.inactiveFunction = ObjectFunctions.PistonPush;
                object.createObject = ObjectFactory.CreateObject(8, orientation);
                break;

            // Piston On
            case 7:
                object.activeFunction = ObjectFunctions.PistonPush;
                object.inactiveFunction = ObjectFunctions.PistonRetract;
                break;

            // Piston Arm
            case 8:
                object.activeFunction = null;
                object.inactiveFunction = null;
                break;

            // Laser
            case 9:
                object.activeFunction = ObjectFunctions.Laser;
                object.inactiveFunction = null;
                break;
        }
        return object;
    }
}