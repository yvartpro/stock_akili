import { Model, DataTypes } from 'sequelize';

export default class Shop extends Model {
	static associate(ExitVoucher) {
		Shop.hasMany(ExitVoucher, { foreignKey: 'shopId', as: 'exitVouchers' });
	}
	static initModel(sequelize) {
		Shop.init({
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
			code: { type: DataTypes.STRING, allowNull: false, unique: true },
			name: { type: DataTypes.STRING, allowNull: false },
			managerName: { type: DataTypes.STRING, allowNull: true },
			location: { type: DataTypes.STRING, allowNull: true },
			phone: { type: DataTypes.STRING, allowNull: true },
			active: { type: DataTypes.BOOLEAN, defaultValue: true }
		}, {
			sequelize,
			modelName: 'Shop',
			tableName: 'shops',
			timestamps: true,
			paranoid: true,
			underscored: true
		});
	}
}