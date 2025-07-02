import { DataTypes, Model } from 'sequelize';
import {sequelize} from '../config/db'; // Adjust path if needed

class Contact extends Model {
  public id!: number;
  public phoneNumber!: string | null;
  public email!: string | null;
  public linkedId!: number | null;
  public linkPrecedence!: 'primary' | 'secondary';
  public deletedAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Contact.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkedId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Contact',
        key: 'id',
      },
    },
    linkPrecedence: {
      type: DataTypes.ENUM('primary', 'secondary'),
      allowNull: false,
      defaultValue: 'primary',
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'Contact',
    timestamps: true,
    updatedAt: 'updatedAt',
    createdAt: 'createdAt',
    paranoid: false, // Set to true if you want Sequelize to handle deletedAt automatically
  }
);

// If you want to define the association in classic style:
Contact.belongsTo(Contact, { as: 'linkedContact', foreignKey: 'linkedId' });

export default Contact;