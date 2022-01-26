const db = require("../../Model");

const limit = require("../extras/DataLimit");

const Permissions = db.permissions;
const Users = db.users;
const DetailedUser = db.usersdetail;
const Merchantdetail = db.MerchantDetails;
const Likes = db.LikeModel;
const WishList = db.WishListModel;
const ImageData = db.imageData;

module.exports = async function (req, res, userId, isBlocked, isRetur) {
  try {
    let members = await Users.findAll({
      raw: true,
      nest: true,
      where: {
        isDelete: false,
        isBlocked: isBlocked,
      },
      include: [
        userId
          ? {
              model: Permissions,
              where: {
                roleId: req.params.roleId,
                userId: userId,
              },
            }
          : {
              model: Permissions,
              where: {
                roleId: req.params.roleId,
              },
            },
        {
          model: DetailedUser,
        },
        {
          model: Likes,
        },
        {
          model: WishList,
        },
        {
          model: Merchantdetail,
        },
        {
          model: ImageData,
        },
      ],
    });

    var setObj = new Set();

    var result = members.reduce((acc, item) => {
      if (!setObj.has(item.id)) {
        setObj.add(item.id, item);
        acc.push(item);
      }
      return acc;
    }, []);

    let countData = {
      page: parseInt(req.query.page),
      pages: Math.ceil(result.length / limit.limit),
      totalRecords: result.length,
    };

    return res.status(200).send({ success: true, data: result, countData });
  } catch (err) {
    return res
      .status(500)
      .send({
        success: false,
        message: err.message || "Something went wrong!",
      });
  }
};
