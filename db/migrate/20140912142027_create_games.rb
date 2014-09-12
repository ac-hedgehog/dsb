class CreateGames < ActiveRecord::Migration
  def change
    create_table :games do |t|
      t.integer :request_id

      t.timestamps
    end
  end
end
