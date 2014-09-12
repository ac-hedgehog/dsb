class CreateRequests < ActiveRecord::Migration
  def change
    create_table :requests do |t|
      t.boolean :satisfied, default: false

      t.timestamps
    end
  end
end
