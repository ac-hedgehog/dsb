class Request < ActiveRecord::Base

  has_one :game, dependent: :destroy

  scope :topical, -> { where("created_at > ?", Time.now - 10.minutes) }
  scope :not_satisfied, -> { where(satisfied: false) }

end
