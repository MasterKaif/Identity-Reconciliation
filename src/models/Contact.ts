import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

@Table({ tableName: 'Contact', timestamps: true, updatedAt: 'updatedAt', createdAt: 'createdAt' })
export class Contact extends Model {
  @Column({ type: DataType.STRING, allowNull: true })
  phoneNumber!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  email!: string;

  @ForeignKey(() => Contact)
  @Column({ type: DataType.INTEGER, allowNull: true })
  linkedId!: number | null;

  @BelongsTo(() => Contact, 'linkedId')
  linkedContact?: Contact;

  @Column({
    type: DataType.ENUM('primary', 'secondary'),
    allowNull: false,
    defaultValue: 'primary',
  })
  linkPrecedence!: 'primary' | 'secondary';

  @Column({ type: DataType.DATE, allowNull: true })
  deletedAt!: Date | null;
}
