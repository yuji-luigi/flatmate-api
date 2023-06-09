import { Request, Response } from 'express';
import logger from '../../config/logger';

import httpStatus from 'http-status';
import mongoose from 'mongoose';
import Space from '../../models/Space';
import { cutQuery, deleteEmptyFields, getEntity, getEntityFromOriginalUrl } from '../../utils/functions';
import { aggregateWithPagination } from '../helpers/mongoose.helper';
import { RequestCustom } from '../../types/custom-express/express-custom';
import vars from '../../config/vars';

// import MSG from '../../utils/messages';
// import { runInNewContext } from 'vm';
// import { deleteEmptyFields, getEntity } from '../../utils/functions';

//================================================================================
// CUSTOM CONTROLLER...
//================================================================================
export const createHeadSpace = async (req: RequestCustom, res: Response) => {
  try {
    const newSpace = new Space({
      ...req.body,
      isHead: true
    });
    await newSpace.save();
    const query = { ...req.query, isHead: true };
    const data = await aggregateWithPagination(query, 'spaces');
    res.status(httpStatus.OK).json({
      success: true,
      collection: 'spaces',
      data: data[0].paginatedResult || [],
      totalDocuments: data[0].counts[0]?.total || 0
    });
    // res.status(httpStatus.CREATED).json({
    //   success: true,
    //   collection: 'spaces',
    //   data: newSpace,
    //   count: 1
    // });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

export const getLinkedChildren = async (req: Request, res: Response) => {
  try {
    //! set pagination logic here and next > parentId page set the pagination logic
    const { parentId, entity } = req.params;
    // const children = await mongoose.model(entity).find({parentId: parentId});x
    req.query.parentId = parentId;
    const data = await aggregateWithPagination(req.query, entity);
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: data[0].paginatedResult || [],
      totalDocuments: data[0].counts[0]?.total || 0
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

export const createLinkedChild = async (req: RequestCustom, res: Response) => {
  try {
    /**
     * find model
     * create model with parentId in the correct field
     * save
     * send the data array to handle in redux
     */
    const { parentId } = req.params;
    const entity = req.params.entity || getEntityFromOriginalUrl(req.originalUrl);

    req.body = deleteEmptyFields(req.body);
    req.body.parentId = parentId; // set the parentId in req.body
    req.body.isTail = false; // set the tail to be false.

    // get the model
    const Model = mongoose.model(entity);
    // const organizationOfUser = req.user.role !== 'super_admin' ? req.user.organization : null;

    // const parentModel = await Model.findById(parentId); // find parentModel

    // const organization = organizationOfUser || (await getOrganizationOfHead(parentId, 'spaces'));
    const childDoc = new Model({ ...req.body });
    const savedChildDoc = await childDoc.save();
    logger.debug(savedChildDoc._doc);
    // parentModel.isTail = false; // set isTail to false
    // await parentModel.save(); // save
    // sendCrudObjectsWithPaginationToClient(req, res);
    req.query = { ...req.query, parentId };
    const data = await aggregateWithPagination(req.query, entity);

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: data[0].paginatedResult || [],
      totalDocuments: data[0].counts[0]?.total || 0
    });
    // res.status(httpStatus.CREATED).json({
    //   success: true,
    //   collection: 'spaces',
    //   data: newModel,
    //   count: 1
    // });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

export const sendHeadDocuments = async (req: Request, res: Response) => {
  try {
    let entity = getEntity(req.url);
    entity = cutQuery(entity);
    // without pagination
    // const children = await mongoose.model(entity).find({isHead: true});
    const query = { ...req.query, isHead: true };
    const data = await aggregateWithPagination(query, entity);
    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: data[0].paginatedResult || [],
      totalDocuments: data[0].counts[0]?.total || 0
    });
    // res.status(httpStatus.CREATED).json({
    //   success: true,
    //   collection: 'spaces',
    //   data: children,
    //   count: 1
    // });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

//! TODO: from next chose to call generic parameter route
export const deleteLinkedChild = async (req: Request, res: Response) => {
  try {
    /**
     * find model
     * create model with parentId in the correct field
     * save
     * send the data array to handle in redux
     */
    let { entity } = req.params;
    const { id } = req.params;
    id;
    entity = 'spaces';
    const deletedDocument = await mongoose.model(entity).findOneAndDelete({ _id: id });
    const query = {
      ...req.query,
      parentId: deletedDocument.parentId
    };
    const data = await aggregateWithPagination(query, entity);

    res.status(httpStatus.OK).json({
      success: true,
      collection: entity,
      data: data[0].paginatedResult || [],
      totalDocuments: data[0].counts[0]?.total || 0
    });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

//! TODO: find way to delete all the children tree of the parent.
export const deleteHeadSpace = async (req: Request, res: Response) => {
  try {
    /**
     * todo:
     * Now only space for the delete one head by id
     * will be set a flag in the frontend. to switch head operations.
     */
    const { id } = req.params;

    await mongoose.model('spaces').findByIdAndDelete({ _id: id });

    const query = { isHead: true };
    const data = await aggregateWithPagination(query, 'spaces');

    res.status(httpStatus.OK).json({
      success: true,
      collection: 'spaces',
      data: data[0].paginatedResult || [],
      totalDocuments: data[0].counts[0]?.total || 0
    });
    // res.status(httpStatus.OK).json({
    //   success: true,
    //   collection: 'spaces',
    //   // data: data[0].paginatedResult || [],
    //   // totalDocuments: data[0].counts[0]?.total || 0
    // });
  } catch (err) {
    logger.error(err.message || err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message || err });
  }
};

export const sendSpaceAsCookie = async (req: Request, res: Response) => {
  try {
    const space = await Space.findById(req.params.spaceId);
    const jwt = space.token();

    res.clearCookie('space');

    res.cookie('space', jwt, {
      httpOnly: true,
      // secure: true,
      sameSite: true,
      domain: vars.cookieDomain,
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    res.status(httpStatus.OK).json({
      success: true,
      collection: 'spaces',
      data: {
        space: {
          _id: space._id,
          name: space.name,
          address: space.address,
          organization: space.organization
        },
        jwt
      },
      count: 1
    });
  } catch (error) {
    logger.error(error.message || error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: error.message || error
    });
  }
};
