from marshmallow import Serializer, fields


class Joint(object):
    """
    A base class with methods to be used by other joints.
    """

    def __init__(self, joint_type=""):
        self.joint_type = joint_type

    def set_attribute(self, attribue, value):
        return setattr(self, attribue, value)

    def set_attributes(self, data):
        """
        A method which takes a dictionary as a parameter and
        sets attribute values with if they exist.
        """

        for attribue in data.keys():
            attribue = str(attribue)
            print(attribue, data[attribue])

            if hasattr(self, attribue):
                self.set_attribute(attribue, data[attribue])
            else:
                raise Exception("Attribue %s not found" % attribue)

    def set_methods(self, data):
        """
        A setter method which takes a dictionary as a parameter and
        calls methods if they exist. Only one parametery is can currently
        be passed into a method.
        """

        for key in data.keys():
            method = str(key)
            value = data[key]

            if callable(getattr(self, method)):
                getattr(self, method)(value)
            else:
                raise Exception("Method %s not implemented" % method)


class HingeJoint(Joint):
    """
    Represents a joint in which the articular surfaces are molded to
    each other in such the manner as to permit motion only in one plane.
    Body-joint examples: Knees, Elbows, Phalanges
    """

    def __init__(self, angle=0):
        super(HingeJoint, self).__init__(joint_type="hinge")
        self.angle = angle

    def move(self, degrees):
        """
        Moves the joint relative to its current position.
        """
        self.angle += degrees

    def reset(self):
        """
        Zeros the joints current position.
        """
        self.angle = 0

    def get_angle(self):
        return self.angle


class PivotJoint(Joint):
    """
    Represents a joint which permits rotation in two directions
    Body-joint examples: Torso
    """
    def __init__(self, rotation=0):
        super(PivotJoint, self).__init__(joint_type="pivot")
        self.rotation = rotation

    def rotate(self, degrees):
        """
        Rotates the joint relative to its current position.
        """
        self.rotation += degrees


class OrthogonalJoint(Joint):
    """
    Represents a joint which permits movement on one plane.
    This joint allows rotation on its axis.
    Body-joint examples: Shoulder, Hip
    """

    def __init__(self, rotation=0, angle=0):
        super(OrthogonalJoint, self).__init__(joint_type="orthogonal")
        self.rotation = rotation
        self.angle = angle

    def rotate(self, degrees):
        """
        Rotates the joint relative to its current position.
        """
        self.rotation += degrees

    def slant(self, degrees):
        """
        Angles the joint left or right relative to its current position.
        """
        self.angle += degrees

    def reset(self):
        """
        Zeros the joints current position.
        """
        self.rotation = 0
        self.angle = 0


class ArticulatedJoint(Joint):
    """
    Represents a joint which permits movement on two planes as well
    as being able to rotate
    Body-joint examples: Wrist, Ankles
    """

    def __init__(self, rotation=0, elevation=0, angle=0):
        super(ArticulatedJoint, self).__init__(joint_type="articulated")
        self.rotation = rotation
        self.elevation = elevation
        self.angle = angle

    def rotate(self, degrees):
        """
        Rotates the joint relative to its current position.
        """
        self.rotation += degrees

    def elevate(self, degrees):
        """
        Raises or lowers the joint relative to its current position.
        """
        self.elevation += degrees

    def slant(self, degrees):
        """
        Angles the joint left or right relative to its current position.
        """
        self.angle += degrees

    def reset(self):
        """
        Zeros the joints current position.
        """
        self.rotation = 0
        self.elevation = 0
        self.angle = 0


class CompliantJoint(Joint):
    """
    The compliant joint type represents a body-joint structure where there are
    several joints linked together which will change shape based on the objects
    that the effector encounters.
    Body-joint example: Fingers
    """

    def __init__(self, rotation=0, elevation=0, angle=0):
        super(CompliantJoint, self).__init__(joint_type="compliant")
        self.tension = 0

    def move(self, degrees):
        """
        Moves the joint relative to its current position.
        """
        self.tension += degrees


class JointSerializer(Serializer):
    joint_type = fields.String()
    href = fields.Method("get_url")

    def get_url(self, obj):
        raise NotImplementedError()


class PivotJointSerializer(JointSerializer):
    rotation = fields.Integer()


class HingeJointSerializer(JointSerializer):
    angle = fields.Integer()


class OrthogonalJointSerializer(JointSerializer):
    rotation = fields.Integer()
    angle = fields.Integer()


class ArticulatedJointSerializer(JointSerializer):
    rotation = fields.Integer()
    elevation = fields.Integer()
    angle = fields.Integer()


class CompliantJointSerializer(JointSerializer):
    tension = fields.Integer()